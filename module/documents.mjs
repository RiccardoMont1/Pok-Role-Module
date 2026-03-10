import {
  COMBAT_FLAG_KEYS,
  getSystemAssetPath,
  MOVE_CATEGORY_LABEL_BY_KEY,
  MOVE_SECONDARY_CONDITION_KEYS,
  MOVE_SECONDARY_DURATION_MODE_KEYS,
  MOVE_SECONDARY_EFFECT_TYPE_KEYS,
  MOVE_SECONDARY_STAT_KEYS,
  MOVE_SECONDARY_TARGET_KEYS,
  MOVE_SECONDARY_TRIGGER_KEYS,
  MOVE_TARGET_KEYS,
  POKROLE,
  SOCIAL_ATTRIBUTE_KEYS,
  TRAIT_LABEL_BY_KEY,
  TYPE_EFFECTIVENESS
} from "./constants.mjs";

function toNumber(value, fallback = 0) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : fallback;
}

function clamp(value, minimum, maximum) {
  return Math.min(Math.max(value, minimum), maximum);
}

function successPoolFormula(dicePool) {
  const normalizedDicePool = Math.max(toNumber(dicePool, 0), 1);
  return `${normalizedDicePool}d6cs>=${POKROLE.SUCCESS_TARGET}`;
}

function hasPainPenaltyException(primaryTraitKey, secondaryTraitKey) {
  return primaryTraitKey === "vitality" || secondaryTraitKey === "vitality";
}

function getTargetActorFromUserSelection() {
  const targets = [...(game.user?.targets ?? [])];
  if (targets.length !== 1) return null;
  return targets[0].actor ?? null;
}

function getCurrentCombatRoundKey() {
  const combat = game.combat;
  if (!combat) return null;
  return `${combat.id}:${combat.round ?? 0}`;
}

const LEGACY_MOVE_TARGET_MAP = Object.freeze({
  foe: "foe",
  "random foe": "random-foe",
  "all foes": "all-foes",
  self: "self",
  user: "self",
  ally: "ally",
  "one ally": "ally",
  "all allies": "all-allies",
  "user and allies": "all-allies",
  area: "area",
  battlefield: "battlefield",
  "foe's battlefield": "foe-battlefield",
  "ally's battlefield": "ally-battlefield",
  "battlefield and area": "battlefield-area",
  "battlefield (foes)": "foe-battlefield"
});

const LEGACY_EFFECT_STAT_MAP = Object.freeze({
  def: "defense",
  defense: "defense",
  spdef: "specialDefense",
  "sp def": "specialDefense",
  "special defense": "specialDefense",
  spec: "special",
  dex: "dexterity",
  attack: "strength",
  "special attack": "special",
  speed: "dexterity",
  accuracy: "accuracy",
  evasion: "evasion",
  clash: "clash"
});

const CONDITION_ALIASES = Object.freeze({
  burn1: "burn",
  burn2: "burn",
  burn3: "burn",
  paralysis: "paralyzed",
  poison: "poisoned",
  badlypoisoned: "badly-poisoned",
  badly_poisoned: "badly-poisoned",
  freeze: "frozen",
  frozen: "frozen",
  confused: "confused"
});

const TEMPORARY_EFFECTS_FLAG = "automation.temporaryEffects";

export class PokRoleActor extends Actor {
  getRollData() {
    const rollData = super.getRollData();
    rollData.system = foundry.utils.deepClone(this.system);
    return rollData;
  }

  getTraitValue(traitKey) {
    if (!traitKey || traitKey === "none") return 0;
    return toNumber(this.system.attributes?.[traitKey], Number.NaN);
  }

  getInitiativeScore() {
    const dexterity = this.getTraitValue("dexterity");
    const alert = this.getSkillValue("alert");
    return Math.max(toNumber(dexterity, 0) + toNumber(alert, 0), 0);
  }

  getDefense(category = "physical") {
    if (category === "special") {
      return Math.max(this.getTraitValue("insight"), 0);
    }
    return Math.max(this.getTraitValue("vitality"), 0);
  }

  getPainPenalty() {
    const hpValue = Math.max(toNumber(this.system.resources?.hp?.value, 0), 0);
    const hpMax = Math.max(toNumber(this.system.resources?.hp?.max, 1), 1);

    if (hpValue <= 1) return 2;
    if (hpValue <= Math.floor(hpMax / 2)) return 1;
    return 0;
  }

  getSkillValue(skillKey) {
    if (!skillKey || skillKey === "none") return 0;
    return toNumber(this.system.skills?.[skillKey], Number.NaN);
  }

  getTraitOrSkillValue(traitKey) {
    const attributeValue = this.getTraitValue(traitKey);
    if (!Number.isNaN(attributeValue)) return attributeValue;

    const skillValue = this.getSkillValue(traitKey);
    if (!Number.isNaN(skillValue)) return skillValue;

    return Number.NaN;
  }

  async rollCombinedDialog() {
    const attributes = Object.keys(this.system.attributes ?? {}).map((key) => ({
      key,
      label: this.localizeTrait(key),
      value: this.getTraitValue(key)
    }));
    const physicalMentalAttributes = attributes.filter(
      (trait) => !SOCIAL_ATTRIBUTE_KEYS.includes(trait.key)
    );
    const socialAttributes = attributes.filter((trait) =>
      SOCIAL_ATTRIBUTE_KEYS.includes(trait.key)
    );
    const skills = Object.keys(this.system.skills ?? {}).map((key) => ({
      key,
      label: this.localizeTrait(key),
      value: this.getSkillValue(key)
    }));
    const renderTraitOptions = (traits) =>
      traits
        .map(
          (trait) => `
            <label class="trait-option">
              <input type="checkbox" name="trait" value="${trait.key}" />
              <span>${trait.label} (${trait.value})</span>
            </label>
          `
        )
        .join("");

    const content = `
      <form class="pok-role-combined-roll">
        <div class="form-group">
          <label>${game.i18n.localize("POKROLE.CombinedRoll.CustomLabel")}</label>
          <input type="text" name="label" value="" />
        </div>
        <div class="form-group">
          <label>${game.i18n.localize("POKROLE.CombinedRoll.RequiredSuccesses")}</label>
          <input type="number" name="requiredSuccesses" min="1" max="5" value="${clamp(toNumber(this.system.combat?.actionNumber, 1), 1, 5)}" />
        </div>
        <div class="form-group">
          <label>${game.i18n.localize("POKROLE.CombinedRoll.RemovedSuccesses")}</label>
          <input type="number" name="manualRemovedSuccesses" min="0" value="0" />
        </div>
        <label class="form-group trait-option compact">
            <input type="checkbox" name="applyPainPenalty" checked />
            <span>${game.i18n.localize("POKROLE.CombinedRoll.ApplyPainPenalty")}</span>
        </label>
        <fieldset>
          <legend>${game.i18n.localize("POKROLE.Attributes.PhysicalMental")}</legend>
          <div class="trait-grid">
            ${renderTraitOptions(physicalMentalAttributes)}
          </div>
        </fieldset>
        <fieldset>
          <legend>${game.i18n.localize("POKROLE.Attributes.Social")}</legend>
          <div class="trait-grid">
            ${renderTraitOptions(socialAttributes)}
          </div>
        </fieldset>
        <fieldset>
          <legend>${game.i18n.localize("POKROLE.Skills.Title")}</legend>
          <div class="trait-grid">
            ${renderTraitOptions(skills)}
          </div>
        </fieldset>
      </form>
    `;

    const html = await new Promise((resolve) => {
      new Dialog({
        title: game.i18n.localize("POKROLE.CombinedRoll.Title"),
        content,
        buttons: {
          roll: {
            icon: "<i class='fas fa-dice-d20'></i>",
            label: game.i18n.localize("POKROLE.CombinedRoll.Roll"),
            callback: (dialogHtml) => resolve(dialogHtml)
          },
          cancel: {
            icon: "<i class='fas fa-times'></i>",
            label: game.i18n.localize("POKROLE.Common.Cancel"),
            callback: () => resolve(null)
          }
        },
        default: "roll",
        close: () => resolve(null)
      }, { classes: ["pok-role-dialog", "pok-role-combined-dialog"] }).render(true);
    });

    if (!html) return null;

    const form = html[0]?.querySelector("form");
    if (!form) return null;

    const selectedTraits = [...form.querySelectorAll("input[name='trait']:checked")].map(
      (checkbox) => checkbox.value
    );
    if (!selectedTraits.length) {
      ui.notifications.warn(game.i18n.localize("POKROLE.Errors.NoTraitsSelected"));
      return null;
    }

    const requiredSuccesses = clamp(
      toNumber(form.querySelector("input[name='requiredSuccesses']")?.value, 1),
      1,
      5
    );
    const manualRemovedSuccesses = Math.max(
      toNumber(form.querySelector("input[name='manualRemovedSuccesses']")?.value, 0),
      0
    );
    const applyPainPenalty =
      form.querySelector("input[name='applyPainPenalty']")?.checked ?? true;
    const removedSuccesses =
      manualRemovedSuccesses + (applyPainPenalty ? this.getPainPenalty() : 0);

    const breakdown = selectedTraits.map((traitKey) => {
      const value = this.getTraitOrSkillValue(traitKey);
      return {
        key: traitKey,
        value: Number.isNaN(value) ? 0 : value
      };
    });
    const dicePool = breakdown.reduce((total, entry) => total + entry.value, 0);
    const customLabel =
      form.querySelector("input[name='label']")?.value?.trim() ?? "";
    const breakdownLabel = breakdown
      .map((entry) => `${this.localizeTrait(entry.key)} ${entry.value}`)
      .join(" + ");

    return this._rollSuccessPool({
      dicePool,
      removedSuccesses,
      requiredSuccesses,
      flavor: game.i18n.format("POKROLE.Chat.CombinedFlavor", {
        actor: this.name,
        label: customLabel || game.i18n.localize("POKROLE.CombinedRoll.DefaultLabel"),
        breakdown: breakdownLabel
      })
    });
  }

  async rollAttribute(attributeKey) {
    const traitValue = this.getTraitValue(attributeKey);
    if (Number.isNaN(traitValue)) {
      ui.notifications.warn(game.i18n.localize("POKROLE.Errors.UnknownAttribute"));
      return null;
    }

    const painPenalty = attributeKey === "vitality" ? 0 : this.getPainPenalty();
    return this._rollSuccessPool({
      dicePool: traitValue,
      removedSuccesses: painPenalty,
      requiredSuccesses: 1,
      flavor: game.i18n.format("POKROLE.Chat.AttributeFlavor", {
        actor: this.name,
        trait: this.localizeTrait(attributeKey)
      })
    });
  }

  async rollSkill(skillKey) {
    const skillValue = this.getSkillValue(skillKey);
    if (Number.isNaN(skillValue)) {
      ui.notifications.warn(game.i18n.localize("POKROLE.Errors.UnknownSkill"));
      return null;
    }

    return this._rollSuccessPool({
      dicePool: skillValue,
      removedSuccesses: this.getPainPenalty(),
      requiredSuccesses: 1,
      flavor: game.i18n.format("POKROLE.Chat.SkillFlavor", {
        actor: this.name,
        trait: this.localizeTrait(skillKey)
      })
    });
  }

  async rollInitiative(options = {}) {
    const roll = await new Roll(POKROLE.INITIATIVE_FORMULA, {
      dexterity: this.getTraitValue("dexterity"),
      alert: this.getSkillValue("alert")
    }).evaluate({ async: true });
    const rolledInitiative = Math.max(toNumber(roll.total, 0), 0);
    await this.update({ "system.combat.initiative": rolledInitiative });

    if (!options.silent) {
      await roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this }),
        flavor: game.i18n.format("POKROLE.Chat.InitiativeFlavor", {
          actor: this.name,
          score: rolledInitiative
        })
      });
    }

    return roll;
  }

  async rollEvasion(actionNumber = null, options = {}) {
    const roundKey = options.roundKey ?? getCurrentCombatRoundKey();
    if (!options.ignoreRoundLimit && !this._canUseReactionThisRound("evasion", roundKey)) {
      ui.notifications.warn(game.i18n.localize("POKROLE.Errors.EvasionAlreadyUsedThisRound"));
      return null;
    }

    const normalizedAction = await this._resolveActionRequirement(actionNumber, roundKey);
    const result = await this._rollSuccessPool({
      dicePool: this.getTraitValue("dexterity") + this.getSkillValue("evasion"),
      removedSuccesses: this.getPainPenalty(),
      requiredSuccesses: normalizedAction,
      flavor: game.i18n.format("POKROLE.Chat.EvasionFlavor", {
        actor: this.name,
        required: normalizedAction
      })
    });

    if (!options.ignoreRoundLimit) {
      await this._markReactionUsedThisRound("evasion", roundKey);
    }
    if (options.advanceAction !== false) {
      await this._advanceActionCounter(normalizedAction, roundKey);
    }
    return result;
  }

  async rollClash(moveId, actionNumber = null, options = {}) {
    if (this.type !== "pokemon") return null;

    const roundKey = options.roundKey ?? getCurrentCombatRoundKey();
    if (!options.ignoreRoundLimit && !this._canUseReactionThisRound("clash", roundKey)) {
      ui.notifications.warn(game.i18n.localize("POKROLE.Errors.ClashAlreadyUsedThisRound"));
      return null;
    }

    const move = this.items.get(moveId);
    if (!move || move.type !== "move") {
      ui.notifications.warn(game.i18n.localize("POKROLE.Errors.UnknownMove"));
      return null;
    }
    if (move.system.category === "support") {
      ui.notifications.warn(game.i18n.localize("POKROLE.Errors.ClashNeedsDamagingMove"));
      return null;
    }

    const damageAttributeKey = this._resolveDamageAttributeKey(move);
    const normalizedAction = await this._resolveActionRequirement(actionNumber, roundKey);
    const removedSuccesses = hasPainPenaltyException(damageAttributeKey, "clash")
      ? 0
      : this.getPainPenalty();

    const result = await this._rollSuccessPool({
      dicePool: this.getTraitValue(damageAttributeKey) + this.getSkillValue("clash"),
      removedSuccesses,
      requiredSuccesses: normalizedAction,
      flavor: game.i18n.format("POKROLE.Chat.ClashFlavor", {
        actor: this.name,
        move: move.name,
        required: normalizedAction
      })
    });

    if (!options.ignoreRoundLimit) {
      await this._markReactionUsedThisRound("clash", roundKey);
    }
    if (options.advanceAction !== false) {
      await this._advanceActionCounter(normalizedAction, roundKey);
    }

    return {
      ...result,
      move
    };
  }

  async rollMove(moveId, options = {}) {
    if (this.type !== "pokemon") return null;

    const move = this.items.get(moveId);
    if (!move || move.type !== "move") {
      ui.notifications.warn(game.i18n.localize("POKROLE.Errors.UnknownMove"));
      return null;
    }
    const roundKey = options.roundKey ?? getCurrentCombatRoundKey();
    const holdingBackMode = await this._resolveHoldingBackChoice(move, options);
    if (holdingBackMode === null) return null;
    const isHoldingBackHalf = holdingBackMode === "half";
    const isHoldingBackNonLethal = holdingBackMode === "nonlethal" && Boolean(move.system.lethal);
    const actionNumber = await this._resolveActionRequirement(options.actionNumber, roundKey);
    const painPenalty = this.getPainPenalty();
    const accuracyAttributeKey = move.system.accuracyAttribute || "dexterity";
    const accuracySkillKey = move.system.accuracySkill || "brawl";
    const accuracyDicePool =
      this.getTraitValue(accuracyAttributeKey) + this.getSkillValue(accuracySkillKey);

    if (Number.isNaN(accuracyDicePool)) {
      ui.notifications.warn(game.i18n.localize("POKROLE.Errors.UnknownMoveTraits"));
      return null;
    }

    const reducedAccuracy = Math.max(toNumber(move.system.reducedAccuracy, 0), 0);
    const accuracyRoll = await new Roll(successPoolFormula(accuracyDicePool)).evaluate({
      async: true
    });
    const rawAccuracySuccesses = toNumber(accuracyRoll.total, 0);
    const removedAccuracySuccesses = reducedAccuracy + painPenalty;
    const netAccuracySuccesses = rawAccuracySuccesses - removedAccuracySuccesses;
    const requiredSuccesses = actionNumber;
    let hit = netAccuracySuccesses >= requiredSuccesses;
    const criticalThreshold = requiredSuccesses + (move.system.highCritical ? 2 : 3);
    const critical = hit && netAccuracySuccesses >= criticalThreshold;

    await accuracyRoll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: game.i18n.format("POKROLE.Chat.MoveAccuracyFlavor", {
        actor: this.name,
        move: move.name,
        required: requiredSuccesses
      })
    });

    const moveTargetKey = this._normalizeMoveTargetKey(move.system?.target);
    const selectedTargetActors = this._getSelectedTargetActors();
    const targetActors = this._resolveActorsForMoveTarget(moveTargetKey, selectedTargetActors);
    const targetActor = targetActors[0] ?? null;
    const moveType = move.system.type || "normal";
    const category = move.system.category || "physical";
    const isDamagingMove = category !== "support";
    let reaction = {
      attempted: false,
      type: "none",
      success: false,
      evaded: false,
      clashResolved: false,
      clashMoveName: "",
      netSuccesses: 0,
      attackerDamage: 0,
      targetDamage: 0,
      label: "POKROLE.Chat.Reaction.None"
    };

    const canUseDefensiveReaction =
      hit &&
      isDamagingMove &&
      targetActor &&
      targetActor !== this &&
      targetActors.length === 1;

    if (canUseDefensiveReaction) {
      reaction = await this._resolveDefensiveReaction({
        targetActor,
        move,
        roundKey,
        netAccuracySuccesses
      });

      if (reaction.evaded) {
        hit = false;
      }
    }

    let damageRoll = null;
    let damageSuccesses = 0;
    let finalDamage = reaction.targetDamage ?? 0;
    let hpAfter = null;
    let hpBefore = null;
    let defense = 0;
    let poolBeforeDefense = 0;
    let damagePool = 0;
    let typeInteraction = {
      immune: false,
      weaknessBonus: 0,
      resistancePenalty: 0,
      label: "POKROLE.Chat.TypeEffect.Neutral"
    };
    let stabDice = 0;
    let criticalDice = critical ? 2 : 0;
    let damageAttributeLabel = this.localizeTrait("none");
    const damageTargetResults = [];

    if (hit && isDamagingMove && !reaction.clashResolved) {
      const damageTargets = this._resolveDamageTargets(moveTargetKey, targetActors);
      const targetsToDamage = damageTargets.length > 0 ? damageTargets : targetActor ? [targetActor] : [];

      for (const actorTarget of targetsToDamage) {
        const damageResult = await this._resolveMoveDamageAgainstTarget({
          move,
          targetActor: actorTarget,
          painPenalty,
          critical,
          isHoldingBackHalf
        });
        damageTargetResults.push(damageResult);
      }

      const firstDamageResult = damageTargetResults[0];
      if (firstDamageResult) {
        damageRoll = firstDamageResult.damageRoll;
        damageSuccesses = firstDamageResult.damageSuccesses;
        finalDamage = firstDamageResult.finalDamage;
        hpBefore = firstDamageResult.hpBefore;
        hpAfter = firstDamageResult.hpAfter;
        defense = firstDamageResult.defense;
        poolBeforeDefense = firstDamageResult.poolBeforeDefense;
        damagePool = firstDamageResult.damagePool;
        typeInteraction = firstDamageResult.typeInteraction;
        stabDice = firstDamageResult.stabDice;
        criticalDice = firstDamageResult.criticalDice;
        damageAttributeLabel = firstDamageResult.damageAttributeLabel;
      }
    }

    const secondaryEffects = this._collectMoveSecondaryEffects(move);
    const moveSecondaryEffectResults = await this._applyMoveSecondaryEffects({
      move,
      moveTargetKey,
      secondaryEffects,
      targetActors,
      hit,
      isDamagingMove,
      finalDamage
    });
    const abilitySecondaryEffectResults = await this._applyAbilityAutomationEffects({
      move,
      moveTargetKey,
      targetActors,
      hit,
      isDamagingMove,
      finalDamage
    });
    const secondaryEffectResults = [
      ...moveSecondaryEffectResults,
      ...abilitySecondaryEffectResults
    ];

    const summaryHtml = await renderTemplate(
      getSystemAssetPath("templates/chat/move-roll.hbs"),
      {
        actorName: this.name,
        moveName: move.name,
        moveTypeLabel: this.localizeTrait(moveType),
        moveTargetLabel: this._localizeMoveTarget(moveTargetKey),
        categoryLabel: game.i18n.localize(
          MOVE_CATEGORY_LABEL_BY_KEY[category] ?? "POKROLE.Common.Unknown"
        ),
        accuracyAttributeLabel: this.localizeTrait(accuracyAttributeKey),
        accuracySkillLabel: this.localizeTrait(accuracySkillKey),
        actionNumber,
        requiredSuccesses,
        rawAccuracySuccesses,
        removedAccuracySuccesses,
        netAccuracySuccesses,
        hit,
        critical,
        reactionAttempted: reaction.attempted,
        reactionTypeLabel: game.i18n.localize(reaction.label),
        reactionSuccess: reaction.success,
        reactionNetSuccesses: reaction.netSuccesses,
        reactionClashMoveName: reaction.clashMoveName,
        reactionAttackerDamage: reaction.attackerDamage,
        reactionTargetDamage: reaction.targetDamage,
        holdingBackActive: holdingBackMode !== "none",
        holdingBackLabel:
          holdingBackMode === "half"
            ? game.i18n.localize("POKROLE.Chat.HoldingBack.HalfDamage")
            : holdingBackMode === "nonlethal"
              ? game.i18n.localize("POKROLE.Chat.HoldingBack.NonLethal")
              : game.i18n.localize("POKROLE.Chat.HoldingBack.None"),
        holdingBackNonLethalApplied: isHoldingBackNonLethal,
        isDamagingMove,
        showDamageSection: hit && isDamagingMove && !reaction.clashResolved,
        damageAttributeLabel,
        poolBeforeDefense,
        defense,
        damagePool,
        damageSuccesses,
        stabDice,
        criticalDice,
        typeLabel: game.i18n.localize(typeInteraction.label),
        finalDamage,
        targetName: targetActor?.name ?? game.i18n.localize("POKROLE.Chat.NoTarget"),
        additionalTargetResults: damageTargetResults.slice(1).map((entry) => ({
          targetName: entry.targetName,
          finalDamage: entry.finalDamage,
          hpBefore: entry.hpBefore,
          hpAfter: entry.hpAfter,
          hasHpUpdate: entry.hpBefore !== null && entry.hpAfter !== null
        })),
        secondaryEffectResults,
        hasSecondaryEffects: secondaryEffectResults.length > 0,
        hasHpUpdate: hpAfter !== null && hpBefore !== null,
        hpBefore,
        hpAfter
      }
    );

    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      content: summaryHtml
    });

    const result = {
      accuracyRoll,
      damageRoll,
      hit,
      critical,
      reaction,
      finalDamage,
      secondaryEffectResults,
      damageTargetResults
    };

    if (options.advanceAction !== false) {
      await this._advanceActionCounter(actionNumber, roundKey);
    }

    return result;
  }

  _normalizeMoveTargetKey(targetKey) {
    const normalized = `${targetKey ?? "foe"}`.trim().toLowerCase();
    if (MOVE_TARGET_KEYS.includes(normalized)) return normalized;
    return LEGACY_MOVE_TARGET_MAP[normalized] ?? "foe";
  }

  _localizeMoveTarget(targetKey) {
    const normalized = this._normalizeMoveTargetKey(targetKey);
    const labelByTarget = {
      foe: "POKROLE.Move.TargetValues.Foe",
      "random-foe": "POKROLE.Move.TargetValues.RandomFoe",
      "all-foes": "POKROLE.Move.TargetValues.AllFoes",
      self: "POKROLE.Move.TargetValues.Self",
      ally: "POKROLE.Move.TargetValues.Ally",
      "all-allies": "POKROLE.Move.TargetValues.AllAllies",
      area: "POKROLE.Move.TargetValues.Area",
      battlefield: "POKROLE.Move.TargetValues.Battlefield",
      "foe-battlefield": "POKROLE.Move.TargetValues.FoeBattlefield",
      "ally-battlefield": "POKROLE.Move.TargetValues.AllyBattlefield",
      "battlefield-area": "POKROLE.Move.TargetValues.BattlefieldArea"
    };
    return game.i18n.localize(labelByTarget[normalized] ?? "POKROLE.Common.Unknown");
  }

  _getSelectedTargetActors() {
    return [...(game.user?.targets ?? [])].map((token) => token.actor).filter(Boolean);
  }

  _resolveActorsForMoveTarget(moveTargetKey, selectedTargetActors = []) {
    const normalizedTarget = this._normalizeMoveTargetKey(moveTargetKey);
    const uniqueActors = new Map();
    const addActor = (actor) => {
      if (!actor) return;
      const actorKey = actor.id ?? actor.uuid ?? actor.name;
      if (!uniqueActors.has(actorKey)) uniqueActors.set(actorKey, actor);
    };

    if (normalizedTarget === "self") {
      addActor(this);
      return [...uniqueActors.values()];
    }

    if (normalizedTarget === "all-allies") {
      addActor(this);
      for (const actor of selectedTargetActors) addActor(actor);
      return [...uniqueActors.values()];
    }

    if (normalizedTarget === "ally") {
      if (selectedTargetActors.length > 0) addActor(selectedTargetActors[0]);
      else addActor(this);
      return [...uniqueActors.values()];
    }

    for (const actor of selectedTargetActors) addActor(actor);
    return [...uniqueActors.values()];
  }

  _resolveDamageTargets(moveTargetKey, targetActors) {
    const normalizedTarget = this._normalizeMoveTargetKey(moveTargetKey);
    if (!Array.isArray(targetActors) || targetActors.length === 0) {
      if (normalizedTarget === "self") return [this];
      return [];
    }

    if (["all-foes", "area", "battlefield-area"].includes(normalizedTarget)) {
      return targetActors;
    }
    return [targetActors[0]];
  }

  async _resolveMoveDamageAgainstTarget({
    move,
    targetActor,
    painPenalty,
    critical,
    isHoldingBackHalf
  }) {
    const category = move.system.category || "physical";
    const moveType = move.system.type || "normal";
    const damageAttributeKey = this._resolveDamageAttributeKey(move);
    const damageAttributeLabel = this.localizeTrait(damageAttributeKey);
    const damageAttributeValue = Math.max(this.getTraitValue(damageAttributeKey), 0);
    const power = Math.max(toNumber(move.system.power, 0), 0);
    const damagePainPenalty = damageAttributeKey === "vitality" ? 0 : painPenalty;
    const criticalDice = critical ? 2 : 0;
    const stabDice = this.hasType(moveType) ? 1 : 0;
    const defense = targetActor ? this._getTargetDefense(targetActor, category) : 0;
    const poolBeforeDefense = damageAttributeValue + power + stabDice + criticalDice - damagePainPenalty;
    const damagePool = Math.max(poolBeforeDefense - defense, 0);
    const typeInteraction = targetActor
      ? this._evaluateTypeInteraction(moveType, targetActor)
      : {
          immune: false,
          weaknessBonus: 0,
          resistancePenalty: 0,
          label: "POKROLE.Chat.TypeEffect.Neutral"
        };

    let damageRoll = null;
    let damageSuccesses = 0;
    if (damagePool > 0) {
      damageRoll = await new Roll(successPoolFormula(damagePool)).evaluate({ async: true });
      damageSuccesses = toNumber(damageRoll.total, 0);
      await damageRoll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this }),
        flavor: `${game.i18n.format("POKROLE.Chat.MoveDamageFlavor", {
          actor: this.name,
          move: move.name
        })} (${targetActor?.name ?? game.i18n.localize("POKROLE.Chat.NoTarget")})`
      });
    }

    const baseDamage = Math.max(damageSuccesses, 1);
    let finalDamage = 0;
    if (!typeInteraction.immune) {
      const weaknessBonus = damageSuccesses >= 1 ? typeInteraction.weaknessBonus : 0;
      const resolvedDamage = Math.max(
        baseDamage + weaknessBonus - typeInteraction.resistancePenalty,
        1
      );
      finalDamage = isHoldingBackHalf
        ? Math.max(Math.floor(resolvedDamage / 2), 1)
        : resolvedDamage;
    }

    let hpBefore = null;
    let hpAfter = null;
    if (targetActor && finalDamage > 0) {
      const hpChange = await this._safeApplyDamage(targetActor, finalDamage);
      hpBefore = hpChange?.hpBefore ?? null;
      hpAfter = hpChange?.hpAfter ?? null;
    }

    return {
      targetActor,
      targetName: targetActor?.name ?? game.i18n.localize("POKROLE.Chat.NoTarget"),
      damageRoll,
      damageSuccesses,
      finalDamage,
      hpBefore,
      hpAfter,
      defense,
      poolBeforeDefense,
      damagePool,
      typeInteraction,
      stabDice,
      criticalDice,
      damageAttributeLabel
    };
  }

  _collectMoveSecondaryEffects(move) {
    const explicitEffects = this._normalizeSecondaryEffectDefinitions(move.system?.secondaryEffects);
    if (explicitEffects.length > 0) return explicitEffects;

    const legacyEffects = this._convertLegacyEffectGroupsToSecondaryEffects(
      move.system?.effectGroups,
      move.system?.target
    );
    if (legacyEffects.length > 0) return legacyEffects;

    return this._inferSecondaryEffectsFromDescription(move.system?.description, move.system?.target);
  }

  _normalizeSecondaryEffectDefinitions(effectList) {
    const rawList = Array.isArray(effectList)
      ? effectList
      : effectList && typeof effectList === "object"
        ? Object.values(effectList)
        : [];
    return rawList.map((effect) => this._normalizeSecondaryEffectDefinition(effect));
  }

  _normalizeSecondaryEffectDefinition(effect) {
    const rawEffect = effect && typeof effect === "object" ? effect : {};
    const trigger = MOVE_SECONDARY_TRIGGER_KEYS.includes(rawEffect.trigger)
      ? rawEffect.trigger
      : "on-hit";
    const target = MOVE_SECONDARY_TARGET_KEYS.includes(rawEffect.target)
      ? rawEffect.target
      : "target";
    const effectType = MOVE_SECONDARY_EFFECT_TYPE_KEYS.includes(rawEffect.effectType)
      ? rawEffect.effectType
      : "condition";
    const durationMode = this._normalizeSecondaryDurationMode(rawEffect.durationMode, effectType);
    const durationRounds = this._normalizeSecondaryDurationRounds(rawEffect.durationRounds);
    const condition = this._normalizeConditionKey(rawEffect.condition);
    const stat = this._normalizeSecondaryStatKey(rawEffect.stat);
    const chance = clamp(Math.floor(toNumber(rawEffect.chance, 100)), 0, 100);
    const amount = clamp(Math.floor(toNumber(rawEffect.amount, 0)), -99, 99);

    return {
      label: `${rawEffect.label ?? ""}`.trim(),
      trigger,
      chance,
      target,
      effectType,
      durationMode,
      durationRounds,
      condition,
      stat,
      amount,
      notes: `${rawEffect.notes ?? ""}`.trim()
    };
  }

  _normalizeSecondaryDurationMode(durationMode, effectType = "custom") {
    const normalized = `${durationMode ?? ""}`.trim().toLowerCase();
    if (MOVE_SECONDARY_DURATION_MODE_KEYS.includes(normalized)) {
      return normalized;
    }
    if (effectType === "stat" || effectType === "combat-stat") {
      return "combat";
    }
    return "manual";
  }

  _normalizeSecondaryDurationRounds(durationRounds) {
    return clamp(Math.floor(toNumber(durationRounds, 1)), 1, 99);
  }

  _normalizeConditionKey(conditionKey) {
    const normalized = `${conditionKey ?? ""}`
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "");
    const alias = CONDITION_ALIASES[normalized] ?? normalized;
    if (MOVE_SECONDARY_CONDITION_KEYS.includes(alias)) return alias;
    if (alias.includes("paraly")) return "paralyzed";
    if (alias.includes("poison")) return "poisoned";
    if (alias.includes("sleep")) return "sleep";
    if (alias.includes("burn")) return "burn";
    if (alias.includes("freez")) return "frozen";
    if (alias.includes("confus")) return "confused";
    if (alias.includes("flinch")) return "flinch";
    if (alias.includes("disable")) return "disabled";
    if (alias.includes("infatuat")) return "infatuated";
    if (alias.includes("faint")) return "fainted";
    return "none";
  }

  _normalizeSecondaryStatKey(statKey) {
    const normalized = `${statKey ?? ""}`
      .trim()
      .toLowerCase()
      .replace(/[_\s]+/g, "")
      .replace(/[^a-z0-9]+/g, "");
    const mapped = LEGACY_EFFECT_STAT_MAP[normalized] ?? normalized;
    if (MOVE_SECONDARY_STAT_KEYS.includes(mapped)) return mapped;
    if (mapped.includes("specialdef")) return "specialDefense";
    if (mapped.includes("def")) return "defense";
    if (mapped.includes("attack")) return "strength";
    if (mapped.includes("speed")) return "dexterity";
    if (mapped.includes("accuracy")) return "accuracy";
    if (mapped.includes("evasion")) return "evasion";
    if (mapped.includes("clash")) return "clash";
    if (mapped.includes("special")) return "special";
    return "none";
  }

  _convertLegacyEffectGroupsToSecondaryEffects(effectGroups, moveTargetKey) {
    if (!Array.isArray(effectGroups) || effectGroups.length === 0) return [];
    const normalizedMoveTarget = this._normalizeMoveTargetKey(moveTargetKey);
    const secondaryEffects = [];

    for (const group of effectGroups) {
      if (!group || typeof group !== "object") continue;
      let chance = 100;
      const conditionType = `${group.condition?.type ?? "none"}`.trim().toLowerCase();
      if (conditionType === "chancedice") {
        const chanceDice = Math.max(toNumber(group.condition?.amount, 1), 1);
        chance = clamp(Math.round((1 - Math.pow(2 / 3, chanceDice)) * 100), 1, 100);
      }

      const effects = Array.isArray(group.effects) ? group.effects : [];
      for (const effect of effects) {
        if (!effect || typeof effect !== "object") continue;
        const type = `${effect.type ?? "custom"}`.trim().toLowerCase();
        const target =
          effect.affects === "user"
            ? "self"
            : ["all-foes", "area", "battlefield-area"].includes(normalizedMoveTarget)
              ? "all-targets"
              : "target";
        secondaryEffects.push(
          this._normalizeSecondaryEffectDefinition({
            label: "",
            trigger: "on-hit",
            chance,
            target,
            effectType:
              type === "ailment"
                ? "condition"
                : type === "statchange"
                  ? "stat"
                  : "custom",
            condition: effect.ailment ?? "none",
            stat: effect.stat ?? "none",
            amount: toNumber(effect.amount, 0),
            notes: ""
          })
        );
      }
    }

    return secondaryEffects;
  }

  _inferSecondaryEffectsFromDescription(description, moveTargetKey) {
    const descriptionText = `${description ?? ""}`.replace(/\s+/g, " ").trim();
    if (!descriptionText) return [];
    const lowerDescription = descriptionText.toLowerCase();
    const inferredEffects = [];
    const signatures = new Set();
    const defaultTarget =
      this._normalizeMoveTargetKey(moveTargetKey) === "self" ? "self" : "target";

    const addEffect = (effect) => {
      const normalized = this._normalizeSecondaryEffectDefinition(effect);
      const signature = JSON.stringify([
        normalized.trigger,
        normalized.chance,
        normalized.target,
        normalized.effectType,
        normalized.condition,
        normalized.stat,
        normalized.amount
      ]);
      if (signatures.has(signature)) return;
      signatures.add(signature);
      inferredEffects.push(normalized);
    };

    const mechanicPattern = /\{mechanic:([a-z-]+)\}/gi;
    let mechanicMatch = mechanicPattern.exec(descriptionText);
    while (mechanicMatch) {
      const conditionKey = this._normalizeConditionKey(mechanicMatch[1]);
      if (conditionKey !== "none") {
        const chance = this._extractChanceBeforeIndex(lowerDescription, mechanicMatch.index);
        addEffect({
          label: "",
          trigger: "on-hit",
          chance,
          target: defaultTarget,
          effectType: "condition",
          condition: conditionKey,
          stat: "none",
          amount: 0,
          notes: ""
        });
      }
      mechanicMatch = mechanicPattern.exec(descriptionText);
    }

    const statusMatchers = [
      { condition: "burn", regex: /(\d{1,3})%\s+chance[^.]*\bburn/i },
      { condition: "frozen", regex: /(\d{1,3})%\s+chance[^.]*\bfreez/i },
      { condition: "paralyzed", regex: /(\d{1,3})%\s+chance[^.]*\bparaly/i },
      { condition: "poisoned", regex: /(\d{1,3})%\s+chance[^.]*\bpoison/i },
      { condition: "sleep", regex: /(\d{1,3})%\s+chance[^.]*\bsleep/i },
      { condition: "confused", regex: /(\d{1,3})%\s+chance[^.]*\bconfus/i },
      { condition: "flinch", regex: /(\d{1,3})%\s+chance[^.]*\bflinch/i }
    ];
    for (const matcher of statusMatchers) {
      const match = matcher.regex.exec(descriptionText);
      if (!match) continue;
      addEffect({
        label: "",
        trigger: "on-hit",
        chance: clamp(toNumber(match[1], 100), 0, 100),
        target: defaultTarget,
        effectType: "condition",
        condition: matcher.condition,
        stat: "none",
        amount: 0,
        notes: ""
      });
    }

    const stageRegex =
      /(?:(\d{1,3})%\s+chance\s+to\s+)?(raise|raises|increase|increases|lower|lowers|decrease|decreases)\s+(?:the\s+)?(user|target|foe|ally|its|their)(?:'s)?\s+([a-z\/\.\s-]+?)\s+by\s+(one|two|three|four|five|six|\d+)\s+stages?/gi;
    let stageMatch = stageRegex.exec(descriptionText);
    while (stageMatch) {
      const chance = stageMatch[1] ? clamp(toNumber(stageMatch[1], 100), 0, 100) : 100;
      const directionWord = `${stageMatch[2] ?? ""}`.toLowerCase();
      const targetWord = `${stageMatch[3] ?? ""}`.toLowerCase();
      const statWord = `${stageMatch[4] ?? ""}`.toLowerCase();
      const amount = this._parseStageAmount(stageMatch[5], directionWord);
      const target = ["user", "its", "their"].includes(targetWord) ? "self" : "target";
      const stat = this._normalizeSecondaryStatKey(statWord);
      if (stat !== "none" && amount !== 0) {
        addEffect({
          label: "",
          trigger: "on-hit",
          chance,
          target,
          effectType: "stat",
          condition: "none",
          stat,
          amount,
          notes: ""
        });
      }
      stageMatch = stageRegex.exec(descriptionText);
    }

    const halfHealRegex =
      /heals?\s+(?:the\s+)?(user|itself|self|target|ally)?[^.]*half[^.]*max hp/i;
    const halfHealMatch = halfHealRegex.exec(descriptionText);
    if (halfHealMatch) {
      const targetWord = `${halfHealMatch[1] ?? ""}`.toLowerCase();
      const target = ["user", "itself", "self"].includes(targetWord) ? "self" : "target";
      addEffect({
        label: "",
        trigger: "on-hit",
        chance: 100,
        target,
        effectType: "heal",
        condition: "none",
        stat: "none",
        amount: -50,
        notes: ""
      });
    }

    const fractionDamageRegex = /(\d+)\s*\/\s*(\d+)\s+(?:of\s+)?(?:the\s+)?target'?s?\s+max hp/i;
    const fractionDamageMatch = fractionDamageRegex.exec(descriptionText);
    if (fractionDamageMatch) {
      const numerator = Math.max(toNumber(fractionDamageMatch[1], 0), 0);
      const denominator = Math.max(toNumber(fractionDamageMatch[2], 1), 1);
      if (numerator > 0) {
        const percent = clamp(Math.round((numerator / denominator) * 100), 1, 100);
        addEffect({
          label: "",
          trigger: "on-hit",
          chance: 100,
          target: defaultTarget,
          effectType: "damage",
          condition: "none",
          stat: "none",
          amount: -percent,
          notes: ""
        });
      }
    }

    return inferredEffects;
  }

  _extractChanceBeforeIndex(text, index) {
    const start = Math.max(index - 140, 0);
    const window = text.slice(start, index + 1);
    const pattern = /(\d{1,3})%\s+chance/gi;
    let chance = null;
    let match = pattern.exec(window);
    while (match) {
      chance = clamp(toNumber(match[1], 100), 0, 100);
      match = pattern.exec(window);
    }
    return chance ?? 100;
  }

  _parseStageAmount(value, directionWord) {
    const text = `${value ?? ""}`.trim().toLowerCase();
    const numberMap = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6 };
    const numericValue = numberMap[text] ?? toNumber(text, 0);
    const sign = ["lower", "lowers", "decrease", "decreases"].includes(directionWord) ? -1 : 1;
    return clamp(sign * Math.max(Math.floor(numericValue), 0), -6, 6);
  }

  async _applyMoveSecondaryEffects({
    move,
    moveTargetKey,
    secondaryEffects,
    targetActors,
    hit,
    isDamagingMove,
    finalDamage
  }) {
    if (!Array.isArray(secondaryEffects) || secondaryEffects.length === 0) {
      return [];
    }

    const results = [];
    for (const effect of secondaryEffects) {
      if (!this._secondaryTriggerMatches(effect.trigger, { hit, isDamagingMove, finalDamage })) {
        continue;
      }

      let chanceRollTotal = null;
      let chanceSucceeded = true;
      if (effect.chance < 100) {
        const chanceRoll = await new Roll("1d100").evaluate({ async: true });
        chanceRollTotal = toNumber(chanceRoll.total, 101);
        chanceSucceeded = chanceRollTotal <= effect.chance;
      }

      if (!chanceSucceeded) {
        results.push({
          label: this._formatSecondaryEffectLabel(effect),
          targetName: game.i18n.localize("POKROLE.Common.None"),
          applied: false,
          detail: game.i18n.format("POKROLE.Chat.SecondaryEffectChanceFailed", {
            roll: chanceRollTotal,
            chance: effect.chance
          })
        });
        continue;
      }

      const effectTargets = this._resolveActorsForSecondaryTarget(effect.target, {
        moveTargetKey,
        targetActors
      });
      if (!effectTargets.length) {
        results.push({
          label: this._formatSecondaryEffectLabel(effect),
          targetName: game.i18n.localize("POKROLE.Chat.NoTarget"),
          applied: false,
          detail: game.i18n.localize("POKROLE.Chat.SecondaryEffectNoTarget")
        });
        continue;
      }

      for (const targetActor of effectTargets) {
        const applyResult = await this._applySecondaryEffectToActor(effect, targetActor, move);
        results.push({
          label: this._formatSecondaryEffectLabel(effect),
          targetName: targetActor.name,
          applied: applyResult.applied,
          detail: applyResult.detail
        });
      }
    }

    return results;
  }

  async _applyAbilityAutomationEffects({
    move,
    moveTargetKey,
    targetActors,
    hit,
    isDamagingMove,
    finalDamage
  }) {
    const abilityItems = this.items.filter((item) => item.type === "ability");
    if (!abilityItems.length) return [];

    const results = [];
    for (const abilityItem of abilityItems) {
      const triggerText = `${abilityItem.system?.trigger ?? ""}`.trim().toLowerCase();
      const triggerAllows =
        !triggerText ||
        triggerText.includes("always") ||
        (hit && triggerText.includes("hit")) ||
        (!hit && triggerText.includes("miss"));
      if (!triggerAllows) continue;

      const payloadEffects = this._parseAbilityAutomationPayload(abilityItem.system?.effect);
      if (!payloadEffects.length) continue;

      const normalizedEffects = payloadEffects.map((effect) =>
        this._normalizeSecondaryEffectDefinition({
          ...effect,
          label: `${effect?.label ?? ""}`.trim() || abilityItem.name
        })
      );

      const effectResults = await this._applyMoveSecondaryEffects({
        move,
        moveTargetKey,
        secondaryEffects: normalizedEffects,
        targetActors,
        hit,
        isDamagingMove,
        finalDamage
      });
      results.push(...effectResults);
    }

    return results;
  }

  _parseAbilityAutomationPayload(effectText) {
    const text = `${effectText ?? ""}`.trim();
    if (!text) return [];
    if (!(text.startsWith("{") || text.startsWith("["))) {
      return [];
    }

    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) return parsed;
      if (parsed && typeof parsed === "object") return [parsed];
    } catch (error) {
      console.warn(`${POKROLE.ID} | Invalid ability automation JSON payload`, error);
    }
    return [];
  }

  _secondaryTriggerMatches(trigger, { hit, isDamagingMove, finalDamage }) {
    switch (`${trigger ?? "on-hit"}`.toLowerCase()) {
      case "always":
        return true;
      case "on-miss":
        return !hit;
      case "on-hit-damage":
        return hit && isDamagingMove && toNumber(finalDamage, 0) > 0;
      case "on-hit":
      default:
        return hit;
    }
  }

  _resolveActorsForSecondaryTarget(targetMode, context) {
    const { moveTargetKey, targetActors } = context;
    const normalizedTarget =
      MOVE_SECONDARY_TARGET_KEYS.includes(targetMode) ? targetMode : "target";
    const uniqueActors = new Map();
    const addActor = (actor) => {
      if (!actor) return;
      const key = actor.id ?? actor.uuid ?? actor.name;
      if (!uniqueActors.has(key)) uniqueActors.set(key, actor);
    };

    switch (normalizedTarget) {
      case "self":
        addActor(this);
        break;
      case "all-targets":
      case "all-foes":
        for (const actor of targetActors ?? []) addActor(actor);
        break;
      case "all-allies":
        addActor(this);
        for (const actor of targetActors ?? []) addActor(actor);
        break;
      case "target":
      default:
        if ((targetActors ?? []).length > 0) {
          addActor(targetActors[0]);
        } else if (this._normalizeMoveTargetKey(moveTargetKey) === "self") {
          addActor(this);
        }
        break;
    }

    return [...uniqueActors.values()];
  }

  _formatSecondaryEffectLabel(effect) {
    if (effect.label) return effect.label;

    const effectTypeLabel = game.i18n.localize(
      `POKROLE.Move.Secondary.Type.${this._toSecondaryTypeLabelSuffix(effect.effectType)}`
    );
    if (effect.effectType === "condition" && effect.condition !== "none") {
      return `${effectTypeLabel}: ${this._localizeConditionName(effect.condition)}`;
    }
    if (
      (effect.effectType === "stat" || effect.effectType === "combat-stat") &&
      effect.stat !== "none" &&
      effect.amount !== 0
    ) {
      const amountText = effect.amount > 0 ? `+${effect.amount}` : `${effect.amount}`;
      return `${effectTypeLabel}: ${this._localizeSecondaryStatName(effect.stat)} ${amountText}`;
    }
    if (["damage", "heal", "will"].includes(effect.effectType)) {
      return `${effectTypeLabel}: ${effect.amount}`;
    }
    return effectTypeLabel;
  }

  _toSecondaryTypeLabelSuffix(effectType) {
    const suffixByType = {
      condition: "Condition",
      stat: "Stat",
      "combat-stat": "CombatStat",
      damage: "Damage",
      heal: "Heal",
      will: "Will",
      custom: "Custom"
    };
    return suffixByType[effectType] ?? "Custom";
  }

  _localizeConditionName(conditionKey) {
    const knownConditionLabels = {
      sleep: "POKROLE.Conditions.Sleep",
      burn: "POKROLE.Conditions.Burn",
      frozen: "POKROLE.Conditions.Frozen",
      paralyzed: "POKROLE.Conditions.Paralyzed",
      poisoned: "POKROLE.Conditions.Poisoned",
      fainted: "POKROLE.Conditions.Fainted",
      confused: "POKROLE.Move.Secondary.Condition.Confused",
      flinch: "POKROLE.Move.Secondary.Condition.Flinch",
      disabled: "POKROLE.Move.Secondary.Condition.Disabled",
      infatuated: "POKROLE.Move.Secondary.Condition.Infatuated",
      "badly-poisoned": "POKROLE.Move.Secondary.Condition.BadlyPoisoned"
    };
    return game.i18n.localize(knownConditionLabels[conditionKey] ?? "POKROLE.Common.Unknown");
  }

  _localizeSecondaryStatName(statKey) {
    const combatStatLabels = {
      accuracy: "POKROLE.Pokemon.Accuracy",
      damage: "POKROLE.Pokemon.Damage",
      evasion: "POKROLE.Pokemon.Evasion",
      clash: "POKROLE.Pokemon.Clash",
      defense: "POKROLE.Combat.Defense",
      specialDefense: "POKROLE.Combat.SpecialDefense"
    };
    if (combatStatLabels[statKey]) {
      return game.i18n.localize(combatStatLabels[statKey]);
    }
    return this.localizeTrait(statKey);
  }

  async _applySecondaryEffectToActor(effect, targetActor, sourceMove = null) {
    switch (effect.effectType) {
      case "condition":
        return this._applyConditionEffectToActor(effect, targetActor, sourceMove);
      case "stat":
        return this._applyStatEffectToActor(effect, targetActor, sourceMove);
      case "combat-stat":
        return this._applyCombatStatEffectToActor(effect, targetActor, sourceMove);
      case "damage": {
        const damageValue = this._resolveEffectAmountValue(
          toNumber(targetActor.system?.resources?.hp?.max, 1),
          effect.amount
        );
        if (damageValue <= 0) {
          return { applied: false, detail: game.i18n.localize("POKROLE.Common.None") };
        }
        const hpChange = await this._safeApplyDamage(targetActor, damageValue);
        if (!hpChange) {
          return { applied: false, detail: game.i18n.localize("POKROLE.Errors.HPUpdateFailed") };
        }
        return {
          applied: true,
          detail: game.i18n.format("POKROLE.Chat.SecondaryEffectHpChange", {
            before: hpChange.hpBefore,
            after: hpChange.hpAfter
          })
        };
      }
      case "heal": {
        const healValue = this._resolveEffectAmountValue(
          toNumber(targetActor.system?.resources?.hp?.max, 1),
          effect.amount
        );
        if (healValue <= 0) {
          return { applied: false, detail: game.i18n.localize("POKROLE.Common.None") };
        }
        const hpChange = await this._safeApplyHeal(targetActor, healValue);
        if (!hpChange) {
          return { applied: false, detail: game.i18n.localize("POKROLE.Errors.HPUpdateFailed") };
        }
        return {
          applied: true,
          detail: game.i18n.format("POKROLE.Chat.SecondaryEffectHpChange", {
            before: hpChange.hpBefore,
            after: hpChange.hpAfter
          })
        };
      }
      case "will":
        return this._applyWillEffectToActor(effect, targetActor);
      case "custom":
      default:
        return {
          applied: true,
          detail: effect.notes || game.i18n.localize("POKROLE.Chat.SecondaryEffectApplied")
        };
    }
  }

  _resolveEffectAmountValue(maxValue, amount) {
    const numericAmount = toNumber(amount, 0);
    if (numericAmount === 0) return 0;
    if (numericAmount > 0) return Math.floor(numericAmount);
    return Math.max(Math.floor((Math.max(maxValue, 1) * Math.abs(numericAmount)) / 100), 1);
  }

  async _applyConditionEffectToActor(effect, targetActor, sourceMove = null) {
    const conditionKey = this._normalizeConditionKey(effect.condition);
    if (conditionKey === "none") {
      return { applied: false, detail: game.i18n.localize("POKROLE.Common.None") };
    }

    const conditionFieldByKey = {
      sleep: "sleep",
      burn: "burn",
      frozen: "frozen",
      paralyzed: "paralyzed",
      poisoned: "poisoned",
      fainted: "fainted"
    };
    const systemConditionField = conditionFieldByKey[conditionKey];
    if (systemConditionField) {
      const alreadyActive = Boolean(targetActor.system.conditions?.[systemConditionField]);
      if (alreadyActive) {
        return {
          applied: false,
          detail: game.i18n.localize("POKROLE.Chat.SecondaryEffectAlreadyActive")
        };
      }
      await targetActor.update({ [`system.conditions.${systemConditionField}`]: true });
      const trackedCondition = await this._trackTemporaryConditionEffect({
        targetActor,
        conditionPath: `system.conditions.${systemConditionField}`,
        label: this._formatSecondaryEffectLabel(effect),
        sourceMove,
        durationMode: this._normalizeSecondaryDurationMode(effect.durationMode, "condition"),
        durationRounds: this._normalizeSecondaryDurationRounds(effect.durationRounds)
      });
      return {
        applied: true,
        detail: `${this._localizeConditionName(conditionKey)} (${this._localizeTemporaryDuration(
          trackedCondition?.durationMode,
          trackedCondition?.durationRounds
        )})`
      };
    }

    await targetActor.setFlag(POKROLE.ID, `automation.conditions.${conditionKey}`, true);
    return {
      applied: true,
      detail: `${this._localizeConditionName(conditionKey)} (${game.i18n.localize(
        "POKROLE.Chat.SecondaryEffectTracked"
      )})`
    };
  }

  async _applyStatEffectToActor(effect, targetActor, sourceMove = null) {
    const amount = Math.floor(toNumber(effect.amount, 0));
    if (amount === 0) {
      return { applied: false, detail: game.i18n.localize("POKROLE.Common.None") };
    }

    const statKey = this._normalizeSecondaryStatKey(effect.stat);
    if (statKey === "none") {
      return { applied: false, detail: game.i18n.localize("POKROLE.Common.Unknown") };
    }

    if (["accuracy", "damage", "evasion", "clash"].includes(statKey)) {
      return this._applyCombatStatEffectToActor(
        { ...effect, effectType: "combat-stat", stat: statKey, amount },
        targetActor,
        sourceMove
      );
    }

    let resolvedKey = statKey;
    if (statKey === "defense") resolvedKey = "vitality";
    if (statKey === "specialDefense") resolvedKey = "insight";

    if (Object.prototype.hasOwnProperty.call(targetActor.system.attributes ?? {}, resolvedKey)) {
      const maxValue = this._resolveAttributeMaximum(targetActor, resolvedKey);
      return this._applyTemporaryTrackedModifier({
        targetActor,
        path: `system.attributes.${resolvedKey}`,
        amount,
        min: 0,
        max: maxValue,
        label: this._formatSecondaryEffectLabel(effect),
        sourceMove,
        detailLabel: this.localizeTrait(resolvedKey),
        durationMode: effect.durationMode,
        durationRounds: effect.durationRounds
      });
    }

    if (Object.prototype.hasOwnProperty.call(targetActor.system.skills ?? {}, resolvedKey)) {
      return this._applyTemporaryTrackedModifier({
        targetActor,
        path: `system.skills.${resolvedKey}`,
        amount,
        min: 0,
        max: 5,
        label: this._formatSecondaryEffectLabel(effect),
        sourceMove,
        detailLabel: this.localizeTrait(resolvedKey),
        durationMode: effect.durationMode,
        durationRounds: effect.durationRounds
      });
    }

    return { applied: false, detail: game.i18n.localize("POKROLE.Common.Unknown") };
  }

  _resolveAttributeMaximum(targetActor, attributeKey) {
    const isCoreAttribute = ["strength", "dexterity", "vitality", "special", "insight"].includes(
      attributeKey
    );
    if (targetActor.type === "pokemon" && isCoreAttribute) {
      return clamp(
        toNumber(targetActor.system.sheetSettings?.trackMax?.attributes?.[attributeKey], 12),
        1,
        12
      );
    }
    return 5;
  }

  getTemporaryEffects() {
    return this._getTemporaryEffectEntries(this);
  }

  async removeTemporaryEffect(effectId, options = {}) {
    const normalizedEffectId = `${effectId ?? ""}`.trim();
    if (!normalizedEffectId) return false;

    const shouldRevert = options.revert !== false;
    const currentEntries = this._getTemporaryEffectEntries(this);
    const effectIndex = currentEntries.findIndex(
      (entry) => `${entry?.id ?? ""}`.trim() === normalizedEffectId
    );
    if (effectIndex < 0) return false;

    const [entryToRemove] = currentEntries.splice(effectIndex, 1);
    if (shouldRevert) {
      await this._revertTemporaryEffectEntry(entryToRemove);
    }
    await this._setTemporaryEffectEntries(this, currentEntries);
    return true;
  }

  async clearCombatTemporaryEffects(combatId = null) {
    const currentEntries = this._getTemporaryEffectEntries(this);
    if (!currentEntries.length) return 0;

    const normalizedCombatId = `${combatId ?? ""}`.trim();
    const remainingEntries = [];
    let clearedCount = 0;

    for (const entry of currentEntries) {
      const isCombatScoped = Boolean(entry?.expiresWithCombat);
      const entryCombatId = `${entry?.combatId ?? ""}`.trim();
      const matchesCombat =
        !normalizedCombatId || !entryCombatId || entryCombatId === normalizedCombatId;
      if (!isCombatScoped || !matchesCombat) {
        remainingEntries.push(entry);
        continue;
      }

      await this._revertTemporaryEffectEntry(entry);
      clearedCount += 1;
    }

    if (clearedCount > 0 || remainingEntries.length !== currentEntries.length) {
      await this._setTemporaryEffectEntries(this, remainingEntries);
    }

    return clearedCount;
  }

  async advanceTemporaryEffectsRound(combatId = null) {
    const currentEntries = this._getTemporaryEffectEntries(this);
    if (!currentEntries.length) return 0;

    const normalizedCombatId = `${combatId ?? ""}`.trim();
    const nextEntries = [];
    let expiredCount = 0;
    let changed = false;

    for (const entry of currentEntries) {
      const durationMode = `${entry?.durationMode ?? "manual"}`.trim().toLowerCase();
      if (durationMode !== "rounds") {
        nextEntries.push(entry);
        continue;
      }

      const entryCombatId = `${entry?.combatId ?? ""}`.trim();
      const matchesCombat =
        !normalizedCombatId || !entryCombatId || entryCombatId === normalizedCombatId;
      if (!matchesCombat) {
        nextEntries.push(entry);
        continue;
      }

      const remainingRounds = this._normalizeSecondaryDurationRounds(entry?.remainingRounds ?? 1);
      const nextRounds = remainingRounds - 1;
      if (nextRounds <= 0) {
        await this._revertTemporaryEffectEntry(entry);
        expiredCount += 1;
        changed = true;
        continue;
      }

      nextEntries.push({
        ...entry,
        remainingRounds: nextRounds
      });
      changed = changed || nextRounds !== remainingRounds;
    }

    if (changed || nextEntries.length !== currentEntries.length) {
      await this._setTemporaryEffectEntries(this, nextEntries);
    }

    return expiredCount;
  }

  _getTemporaryEffectEntries(targetActor) {
    const rawEntries = targetActor?.getFlag(POKROLE.ID, TEMPORARY_EFFECTS_FLAG);
    if (!Array.isArray(rawEntries)) return [];
    return rawEntries.filter((entry) => entry && typeof entry === "object");
  }

  async _setTemporaryEffectEntries(targetActor, entries) {
    const normalizedEntries = Array.isArray(entries)
      ? entries.filter((entry) => entry && typeof entry === "object")
      : [];
    await targetActor.setFlag(POKROLE.ID, TEMPORARY_EFFECTS_FLAG, normalizedEntries);
  }

  async _trackTemporaryConditionEffect({
    targetActor,
    conditionPath,
    label = "",
    sourceMove = null,
    durationMode = "manual",
    durationRounds = 1
  }) {
    if (!targetActor || !conditionPath) {
      return { durationMode: "manual", durationRounds: 1 };
    }

    const normalizedRounds = this._normalizeSecondaryDurationRounds(durationRounds);
    const requestedMode = this._normalizeSecondaryDurationMode(durationMode, "condition");
    const combatId = game.combat?.id ?? null;
    const combatRound = game.combat?.round ?? null;
    const effectiveMode =
      (requestedMode === "combat" || requestedMode === "rounds") && !combatId
        ? "manual"
        : requestedMode;
    const isCombatScoped = effectiveMode === "combat" || effectiveMode === "rounds";

    const effectEntries = this._getTemporaryEffectEntries(targetActor);
    const effectId =
      foundry.utils.randomID?.() ??
      `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
    effectEntries.push({
      id: effectId,
      label: `${label ?? ""}`.trim() || game.i18n.localize("POKROLE.TemporaryEffects.Title"),
      effectType: "condition",
      sourceMoveId: sourceMove?.id ?? null,
      sourceMoveName: sourceMove?.name ?? "",
      sourceActorId: this.id ?? null,
      sourceActorName: this.name ?? "",
      durationMode: effectiveMode,
      remainingRounds: effectiveMode === "rounds" ? normalizedRounds : null,
      expiresWithCombat: isCombatScoped,
      combatId: isCombatScoped ? combatId : null,
      appliedRound: isCombatScoped ? combatRound : null,
      createdAt: Date.now(),
      changes: [
        {
          kind: "boolean",
          path: conditionPath,
          previousValue: false
        }
      ]
    });
    await this._setTemporaryEffectEntries(targetActor, effectEntries);
    return {
      durationMode: effectiveMode,
      durationRounds: normalizedRounds
    };
  }

  async _applyTemporaryTrackedModifier({
    targetActor,
    path,
    amount,
    min = 0,
    max = 99,
    label = "",
    sourceMove = null,
    detailLabel = "",
    durationMode = "combat",
    durationRounds = 1
  }) {
    const numericAmount = Math.floor(toNumber(amount, 0));
    if (!targetActor || !path || numericAmount === 0) {
      return { applied: false, detail: game.i18n.localize("POKROLE.Common.None") };
    }

    const currentValue = toNumber(foundry.utils.getProperty(targetActor, path), 0);
    const nextValue = clamp(currentValue + numericAmount, min, max);
    const appliedAmount = nextValue - currentValue;
    if (appliedAmount === 0) {
      return {
        applied: false,
        detail: game.i18n.localize("POKROLE.Chat.SecondaryEffectNoStatChange")
      };
    }

    await targetActor.update({ [path]: nextValue });

    const normalizedRounds = this._normalizeSecondaryDurationRounds(durationRounds);
    const requestedMode = this._normalizeSecondaryDurationMode(durationMode, "stat");
    const combatId = game.combat?.id ?? null;
    const combatRound = game.combat?.round ?? null;
    const effectiveMode =
      (requestedMode === "combat" || requestedMode === "rounds") && !combatId
        ? "manual"
        : requestedMode;
    const isCombatScoped = effectiveMode === "combat" || effectiveMode === "rounds";
    const effectId =
      foundry.utils.randomID?.() ??
      `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
    const effectEntries = this._getTemporaryEffectEntries(targetActor);
    effectEntries.push({
      id: effectId,
      label: `${label ?? ""}`.trim() || game.i18n.localize("POKROLE.TemporaryEffects.Title"),
      effectType: "modifier",
      sourceMoveId: sourceMove?.id ?? null,
      sourceMoveName: sourceMove?.name ?? "",
      sourceActorId: this.id ?? null,
      sourceActorName: this.name ?? "",
      durationMode: effectiveMode,
      remainingRounds: effectiveMode === "rounds" ? normalizedRounds : null,
      expiresWithCombat: isCombatScoped,
      combatId: isCombatScoped ? combatId : null,
      appliedRound: isCombatScoped ? combatRound : null,
      createdAt: Date.now(),
      changes: [
        {
          path,
          amountApplied: appliedAmount,
          min,
          max
        }
      ]
    });
    await this._setTemporaryEffectEntries(targetActor, effectEntries);

    const durationLabel = this._localizeTemporaryDuration(effectiveMode, normalizedRounds);
    return {
      applied: true,
      detail: `${detailLabel || path} ${currentValue} -> ${nextValue} (${durationLabel})`
    };
  }

  _localizeTemporaryDuration(durationMode, rounds = 1) {
    const normalizedMode = `${durationMode ?? "manual"}`.trim().toLowerCase();
    if (normalizedMode === "combat") {
      return game.i18n.localize("POKROLE.TemporaryEffects.DurationCombat");
    }
    if (normalizedMode === "rounds") {
      const normalizedRounds = this._normalizeSecondaryDurationRounds(rounds);
      return game.i18n.format("POKROLE.TemporaryEffects.DurationRoundsWithValue", {
        rounds: normalizedRounds
      });
    }
    return game.i18n.localize("POKROLE.TemporaryEffects.DurationManual");
  }

  async _revertTemporaryEffectEntry(entry) {
    const effectChanges = Array.isArray(entry?.changes) ? entry.changes : [];
    if (!effectChanges.length) return;

    const updates = {};
    for (const change of effectChanges) {
      const path = `${change?.path ?? ""}`.trim();
      if (!path.startsWith("system.")) continue;

      const changeKind = `${change?.kind ?? "number"}`.trim().toLowerCase();
      if (changeKind === "boolean") {
        updates[path] = Boolean(change?.previousValue);
        continue;
      }

      const amountApplied = toNumber(change?.amountApplied, 0);
      if (amountApplied === 0) continue;

      const minValue = Number(change?.min);
      const maxValue = Number(change?.max);
      const min = Number.isFinite(minValue) ? minValue : 0;
      const max = Number.isFinite(maxValue) ? maxValue : 999;
      const currentValue = toNumber(foundry.utils.getProperty(this, path), 0);
      const nextValue = clamp(currentValue - amountApplied, min, max);
      if (nextValue === currentValue) continue;
      updates[path] = nextValue;
    }

    if (Object.keys(updates).length > 0) {
      await this.update(updates);
    }
  }

  async _applyCombatStatEffectToActor(effect, targetActor, sourceMove = null) {
    const amount = Math.floor(toNumber(effect.amount, 0));
    if (amount === 0) {
      return { applied: false, detail: game.i18n.localize("POKROLE.Common.None") };
    }

    const validCombatStats = ["accuracy", "damage", "evasion", "clash"];
    const statKey = `${effect.stat ?? ""}`.trim();
    if (!validCombatStats.includes(statKey)) {
      return { applied: false, detail: game.i18n.localize("POKROLE.Common.Unknown") };
    }

    return this._applyTemporaryTrackedModifier({
      targetActor,
      path: `system.combatProfile.${statKey}`,
      amount,
      min: 0,
      max: 99,
      label: this._formatSecondaryEffectLabel(effect),
      sourceMove,
      detailLabel: this._localizeSecondaryStatName(statKey),
      durationMode: effect.durationMode,
      durationRounds: effect.durationRounds
    });
  }

  async _applyWillEffectToActor(effect, targetActor) {
    const maxWill = Math.max(toNumber(targetActor.system.resources?.will?.max, 1), 1);
    const amount = Math.floor(toNumber(effect.amount, 0));
    if (amount === 0) {
      return { applied: false, detail: game.i18n.localize("POKROLE.Common.None") };
    }

    const currentWill = Math.max(toNumber(targetActor.system.resources?.will?.value, 0), 0);
    const nextWill = clamp(currentWill + amount, 0, maxWill);
    if (nextWill === currentWill) {
      return {
        applied: false,
        detail: game.i18n.localize("POKROLE.Chat.SecondaryEffectNoStatChange")
      };
    }
    await targetActor.update({ "system.resources.will.value": nextWill });
    return {
      applied: true,
      detail: `${currentWill} -> ${nextWill}`
    };
  }

  async _safeApplyHeal(targetActor, healAmount) {
    const normalizedHeal = Math.max(toNumber(healAmount, 0), 0);
    if (!targetActor || normalizedHeal <= 0) {
      return null;
    }

    const hpValue = Math.max(toNumber(targetActor.system.resources?.hp?.value, 0), 0);
    const hpMax = Math.max(toNumber(targetActor.system.resources?.hp?.max, 1), 1);
    const hpAfter = Math.min(hpValue + normalizedHeal, hpMax);
    if (hpAfter === hpValue) {
      return { hpBefore: hpValue, hpAfter };
    }
    try {
      await targetActor.update({ "system.resources.hp.value": hpAfter });
    } catch (error) {
      console.error(`${POKROLE.ID} | Failed to apply heal`, error);
      ui.notifications.warn(game.i18n.localize("POKROLE.Errors.HPUpdateFailed"));
    }

    return {
      hpBefore: hpValue,
      hpAfter
    };
  }

  async useGearItem(itemId, options = {}) {
    const gearItem = this.items.get(itemId);
    if (!gearItem || gearItem.type !== "gear") {
      ui.notifications.warn(game.i18n.localize("POKROLE.Errors.UnknownGear"));
      return null;
    }

    const quantity = Math.max(toNumber(gearItem.system.quantity, 0), 0);
    if (quantity <= 0) {
      ui.notifications.warn(game.i18n.localize("POKROLE.Errors.GearOutOfStock"));
      return null;
    }

    const pocket = `${gearItem.system.pocket ?? "main"}`.toLowerCase();
    const pocketUsableInBattle = pocket === "potions" || pocket === "small";
    if (game.combat && (!pocketUsableInBattle || !gearItem.system.canUseInBattle)) {
      ui.notifications.warn(game.i18n.localize("POKROLE.Errors.GearNotUsableInBattle"));
      return null;
    }

    const targetActor = options.targetActor ?? getTargetActorFromUserSelection() ?? this;
    if (gearItem.system.target === "trainer" && targetActor.type !== "trainer") {
      ui.notifications.warn(game.i18n.localize("POKROLE.Errors.GearWrongTarget"));
      return null;
    }
    if (gearItem.system.target === "pokemon" && targetActor.type !== "pokemon") {
      ui.notifications.warn(game.i18n.localize("POKROLE.Errors.GearWrongTarget"));
      return null;
    }

    const hpBefore = Math.max(toNumber(targetActor.system.resources?.hp?.value, 0), 0);
    const hpMax = Math.max(toNumber(targetActor.system.resources?.hp?.max, 1), 1);
    const healsFullHp = gearItem.system.heal?.fullHp ?? false;
    const healHpValue = Math.max(toNumber(gearItem.system.heal?.hp, 0), 0);

    let hpAfter = hpBefore;
    if (healsFullHp) {
      hpAfter = hpMax;
    } else if (healHpValue > 0) {
      hpAfter = Math.min(hpBefore + healHpValue, hpMax);
    }
    const healedAmount = Math.max(hpAfter - hpBefore, 0);

    if (hpAfter !== hpBefore) {
      await targetActor.update({ "system.resources.hp.value": hpAfter });
    }

    const consumeResult = gearItem.system.consumable ? await this._consumeGearItem(gearItem) : null;
    const statusEffects = this._getGearStatusEffects(gearItem).map((statusKey) =>
      game.i18n.localize(`POKROLE.Gear.Status.${statusKey}`)
    );

    const notes = [];
    const healLethalValue = Math.max(toNumber(gearItem.system.heal?.lethal, 0), 0);
    if (healLethalValue > 0) {
      notes.push(
        game.i18n.format("POKROLE.Chat.GearLethalHealNote", {
          value: healLethalValue
        })
      );
    }
    if (gearItem.system.heal?.restoreAwareness) {
      notes.push(game.i18n.localize("POKROLE.Chat.GearAwarenessNote"));
    }
    if (statusEffects.length > 0) {
      notes.push(
        game.i18n.format("POKROLE.Chat.GearStatusNote", {
          value: statusEffects.join(", ")
        })
      );
    }

    const stockLabel = consumeResult
      ? consumeResult.unitsMax > 0
        ? `${consumeResult.quantity} x (${consumeResult.unitsValue}/${consumeResult.unitsMax})`
        : `${consumeResult.quantity}`
      : game.i18n.localize("POKROLE.Common.None");

    const content = `
      <div class="pok-role-chat-card">
        <h3>${game.i18n.localize("POKROLE.Chat.GearUsed")}: ${gearItem.name}</h3>
        <p><strong>${game.i18n.localize("POKROLE.Chat.Actor")}:</strong> ${this.name}</p>
        <p><strong>${game.i18n.localize("POKROLE.Chat.Target")}:</strong> ${targetActor.name}</p>
        <p><strong>${game.i18n.localize("POKROLE.Gear.HealHp")}:</strong> +${healedAmount}</p>
        <p><strong>${game.i18n.localize("POKROLE.Chat.TargetHP")}:</strong> ${hpBefore} -> ${hpAfter}</p>
        ${
          consumeResult
            ? `<p><strong>${game.i18n.localize("POKROLE.Gear.Stock")}:</strong> ${stockLabel}</p>`
            : ""
        }
        ${
          notes.length > 0
            ? `<hr /><p>${notes.join("<br />")}</p>`
            : ""
        }
      </div>
    `;

    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      content
    });

    return {
      targetActor,
      hpBefore,
      hpAfter,
      healedAmount,
      consumeResult
    };
  }

  hasType(typeKey) {
    const primary = this.system.types?.primary || "none";
    const secondary = this.system.types?.secondary || "none";
    return typeKey === primary || typeKey === secondary;
  }

  localizeTrait(traitKey) {
    const labelPath = TRAIT_LABEL_BY_KEY[traitKey] || "POKROLE.Common.Unknown";
    return game.i18n.localize(labelPath);
  }

  async _resolveDefensiveReaction({
    targetActor,
    move,
    roundKey,
    netAccuracySuccesses
  }) {
    const socialAccuracyMove = this._isSocialAccuracyMove(move);
    const moveCanBeEvaded = !socialAccuracyMove && !move.system.neverFail;
    const moveCanBeClashed = !socialAccuracyMove;

    const choice = await this._promptDefensiveReaction({
      targetActor,
      move,
      roundKey,
      moveCanBeEvaded,
      moveCanBeClashed
    });

    if (!choice || choice.type === "none") {
      return {
        attempted: false,
        type: "none",
        success: false,
        evaded: false,
        clashResolved: false,
        clashMoveName: "",
        netSuccesses: 0,
        attackerDamage: 0,
        targetDamage: 0,
        label: "POKROLE.Chat.Reaction.None"
      };
    }

    if (choice.type === "evasion") {
      const evasionResult = await targetActor.rollEvasion(null, { roundKey });
      if (!evasionResult) {
        return {
          attempted: true,
          type: "evasion",
          success: false,
          evaded: false,
          clashResolved: false,
          clashMoveName: "",
          netSuccesses: 0,
          attackerDamage: 0,
          targetDamage: 0,
          label: "POKROLE.Chat.Reaction.EvasionFailed"
        };
      }

      const success = evasionResult.netSuccesses >= netAccuracySuccesses;
      return {
        attempted: true,
        type: "evasion",
        success,
        evaded: success,
        clashResolved: false,
        clashMoveName: "",
        netSuccesses: evasionResult.netSuccesses,
        attackerDamage: 0,
        targetDamage: 0,
        label: success
          ? "POKROLE.Chat.Reaction.EvasionSuccess"
          : "POKROLE.Chat.Reaction.EvasionFailed"
      };
    }

    if (choice.type === "clash") {
      const clashResult = await targetActor.rollClash(choice.clashMoveId, null, {
        roundKey
      });
      if (!clashResult) {
        return {
          attempted: true,
          type: "clash",
          success: false,
          evaded: false,
          clashResolved: false,
          clashMoveName: "",
          netSuccesses: 0,
          attackerDamage: 0,
          targetDamage: 0,
          label: "POKROLE.Chat.Reaction.ClashFailed"
        };
      }

      const success = clashResult.netSuccesses >= netAccuracySuccesses;
      if (!success) {
        return {
          attempted: true,
          type: "clash",
          success: false,
          evaded: false,
          clashResolved: false,
          clashMoveName: clashResult.move?.name ?? "",
          netSuccesses: clashResult.netSuccesses,
          attackerDamage: 0,
          targetDamage: 0,
          label: "POKROLE.Chat.Reaction.ClashFailed"
        };
      }

      const defenderDamage = this._computeClashDamage(move.system.type, targetActor);
      const attackerDamage = this._computeClashDamage(
        clashResult.move?.system?.type ?? "normal",
        this
      );
      await this._safeApplyDamage(targetActor, defenderDamage);
      await this._safeApplyDamage(this, attackerDamage);

      return {
        attempted: true,
        type: "clash",
        success: true,
        evaded: false,
        clashResolved: true,
        clashMoveName: clashResult.move?.name ?? "",
        netSuccesses: clashResult.netSuccesses,
        attackerDamage,
        targetDamage: defenderDamage,
        label: "POKROLE.Chat.Reaction.ClashSuccess"
      };
    }

    return {
      attempted: false,
      type: "none",
      success: false,
      evaded: false,
      clashResolved: false,
      clashMoveName: "",
      netSuccesses: 0,
      attackerDamage: 0,
      targetDamage: 0,
      label: "POKROLE.Chat.Reaction.None"
    };
  }

  async _promptDefensiveReaction({
    targetActor,
    move,
    roundKey,
    moveCanBeEvaded,
    moveCanBeClashed
  }) {
    const canUseEvasion =
      moveCanBeEvaded && targetActor._canUseReactionThisRound("evasion", roundKey);
    const clashMoves = targetActor.items
      .filter((item) => item.type === "move" && item.system.category !== "support");
    const canUseClash =
      moveCanBeClashed &&
      targetActor._canUseReactionThisRound("clash", roundKey) &&
      clashMoves.length > 0;

    if (!canUseEvasion && !canUseClash) {
      return { type: "none" };
    }

    const content = `
      <form class="pok-role-reaction-dialog">
        <p class="dialog-intro">
          ${game.i18n.format("POKROLE.Combat.ReactionPrompt", {
            target: targetActor.name,
            move: move.name
          })}
        </p>
        <label class="trait-option compact">
          <input type="radio" name="reactionType" value="none" checked />
          <span>${game.i18n.localize("POKROLE.Chat.Reaction.None")}</span>
        </label>
        ${
          canUseEvasion
            ? `
          <label class="trait-option compact">
            <input type="radio" name="reactionType" value="evasion" />
            <span>${game.i18n.localize("POKROLE.Chat.Reaction.UseEvasion")}</span>
          </label>
        `
            : ""
        }
        ${
          canUseClash
            ? `
          <label class="trait-option compact">
            <input type="radio" name="reactionType" value="clash" />
            <span>${game.i18n.localize("POKROLE.Chat.Reaction.UseClash")}</span>
          </label>
          <div class="form-group nested">
            <label>${game.i18n.localize("POKROLE.Combat.ClashMove")}</label>
            <select name="clashMoveId">
              ${clashMoves
                .map((clashMove) => `<option value="${clashMove.id}">${clashMove.name}</option>`)
                .join("")}
            </select>
          </div>
        `
            : ""
        }
      </form>
    `;

    const html = await new Promise((resolve) => {
      new Dialog({
        title: game.i18n.localize("POKROLE.Combat.ReactionTitle"),
        content,
        buttons: {
          confirm: {
            icon: "<i class='fas fa-check'></i>",
            label: game.i18n.localize("POKROLE.Combat.ConfirmReaction"),
            callback: (dialogHtml) => resolve(dialogHtml)
          },
          skip: {
            icon: "<i class='fas fa-forward'></i>",
            label: game.i18n.localize("POKROLE.Combat.SkipReaction"),
            callback: () => resolve(null)
          }
        },
        default: "confirm",
        close: () => resolve(null)
      }, { classes: ["pok-role-dialog", "pok-role-reaction-app"] }).render(true);
    });

    if (!html) return { type: "none" };
    const form = html[0]?.querySelector("form");
    if (!form) return { type: "none" };

    const type = form.querySelector("input[name='reactionType']:checked")?.value ?? "none";
    const clashMoveId = form.querySelector("select[name='clashMoveId']")?.value ?? "";
    return { type, clashMoveId };
  }

  async _resolveHoldingBackChoice(move, options = {}) {
    if (!move || move.type !== "move" || move.system.category === "support") {
      return "none";
    }

    const normalizedOption = `${options.holdingBack ?? ""}`.trim().toLowerCase();
    if (normalizedOption === "none" || normalizedOption === "half") {
      return normalizedOption;
    }
    if (normalizedOption === "nonlethal") {
      return move.system.lethal ? "nonlethal" : "none";
    }

    if (options.promptHoldingBack === false) {
      return "none";
    }

    return new Promise((resolve) => {
      const buttons = {
        normal: {
          icon: "<i class='fas fa-check'></i>",
          label: game.i18n.localize("POKROLE.Combat.HoldingBackNormal"),
          callback: () => resolve("none")
        },
        half: {
          icon: "<i class='fas fa-hand-paper'></i>",
          label: game.i18n.localize("POKROLE.Combat.HoldingBackHalf"),
          callback: () => resolve("half")
        }
      };

      if (move.system.lethal) {
        buttons.nonlethal = {
          icon: "<i class='fas fa-shield-heart'></i>",
          label: game.i18n.localize("POKROLE.Combat.HoldingBackNonLethal"),
          callback: () => resolve("nonlethal")
        };
      }

      new Dialog({
        title: game.i18n.localize("POKROLE.Combat.HoldingBackTitle"),
        content: `
          <div class="pok-role-holding-back-dialog">
            <p class="dialog-intro">${game.i18n.format("POKROLE.Combat.HoldingBackPrompt", {
              move: move.name
            })}</p>
          </div>
        `,
        buttons,
        default: "normal",
        close: () => resolve("none")
      }, { classes: ["pok-role-dialog", "pok-role-holding-back-app"] }).render(true);
    });
  }

  _computeClashDamage(moveType, targetActor) {
    const interaction = this._evaluateTypeInteraction(moveType, targetActor);
    if (interaction.immune) return 0;
    return Math.max(1 + interaction.weaknessBonus - interaction.resistancePenalty, 1);
  }

  _isSocialAccuracyMove(move) {
    return SOCIAL_ATTRIBUTE_KEYS.includes(move.system.accuracyAttribute);
  }

  _getGearStatusEffects(gearItem) {
    if (gearItem.system.status?.all) {
      return ["All"];
    }

    const statusKeys = [
      ["poison", "Poison"],
      ["sleep", "Sleep"],
      ["burn", "Burn"],
      ["frozen", "Frozen"],
      ["paralysis", "Paralysis"],
      ["confusion", "Confusion"]
    ];
    return statusKeys
      .filter(([statusKey]) => gearItem.system.status?.[statusKey])
      .map(([, labelKey]) => labelKey);
  }

  async _consumeGearItem(gearItem) {
    const quantity = Math.max(toNumber(gearItem.system.quantity, 0), 0);
    const unitsMax = Math.max(toNumber(gearItem.system.units?.max, 0), 0);
    let unitsValue = Math.max(toNumber(gearItem.system.units?.value, 0), 0);

    if (quantity <= 0) {
      ui.notifications.warn(game.i18n.localize("POKROLE.Errors.GearOutOfStock"));
      return null;
    }

    const updates = {};
    let nextQuantity = quantity;
    let nextUnitsValue = unitsValue;

    if (unitsMax > 0) {
      if (nextUnitsValue <= 0 && nextQuantity > 0) {
        nextUnitsValue = unitsMax;
      }
      nextUnitsValue = Math.max(nextUnitsValue - 1, 0);
      if (nextUnitsValue === 0) {
        nextQuantity = Math.max(nextQuantity - 1, 0);
        if (nextQuantity > 0) {
          nextUnitsValue = unitsMax;
        }
      }
      updates["system.units.value"] = nextUnitsValue;
      updates["system.quantity"] = nextQuantity;
    } else {
      nextQuantity = Math.max(nextQuantity - 1, 0);
      updates["system.quantity"] = nextQuantity;
    }

    await gearItem.update(updates);

    return {
      quantity: nextQuantity,
      unitsValue: nextUnitsValue,
      unitsMax
    };
  }

  async resetActionCounter(options = {}) {
    await this.resetTurnState({ ...options, resetInitiative: false });
  }

  async resetTurnState(options = {}) {
    const roundKey = options.roundKey ?? getCurrentCombatRoundKey();
    const updates = {};
    const currentActionNumber = clamp(toNumber(this.system.combat?.actionNumber, 1), 1, 5);
    if (currentActionNumber !== 1) {
      updates["system.combat.actionNumber"] = 1;
    }
    if (options.resetInitiative !== false) {
      const currentInitiative = Math.max(toNumber(this.system.combat?.initiative, 0), 0);
      if (currentInitiative !== 0) {
        updates["system.combat.initiative"] = 0;
      }
    }
    if (Object.keys(updates).length > 0) {
      await this.update(updates);
    }
    if (roundKey) {
      await this.setFlag(POKROLE.ID, COMBAT_FLAG_KEYS.LAST_ACTION_ROUND, roundKey);
    }
  }

  async _resolveActionRequirement(actionNumber, roundKey) {
    await this._resetActionCounterForRound(roundKey);
    if (actionNumber !== null && actionNumber !== undefined) {
      return clamp(toNumber(actionNumber, 1), 1, 5);
    }
    return clamp(toNumber(this.system.combat?.actionNumber, 1), 1, 5);
  }

  async _resetActionCounterForRound(roundKey) {
    if (!roundKey) return;
    const lastActionRound = this.getFlag(POKROLE.ID, COMBAT_FLAG_KEYS.LAST_ACTION_ROUND);
    if (lastActionRound === roundKey) return;

    const currentActionNumber = clamp(toNumber(this.system.combat?.actionNumber, 1), 1, 5);
    if (currentActionNumber !== 1) {
      await this.update({ "system.combat.actionNumber": 1 });
    }
    await this.setFlag(POKROLE.ID, COMBAT_FLAG_KEYS.LAST_ACTION_ROUND, roundKey);
  }

  async _advanceActionCounter(actionNumber, roundKey) {
    const nextActionNumber = clamp(toNumber(actionNumber, 1) + 1, 1, 5);
    const currentActionNumber = clamp(toNumber(this.system.combat?.actionNumber, 1), 1, 5);
    if (nextActionNumber !== currentActionNumber) {
      await this.update({ "system.combat.actionNumber": nextActionNumber });
    }
    if (roundKey) {
      await this.setFlag(POKROLE.ID, COMBAT_FLAG_KEYS.LAST_ACTION_ROUND, roundKey);
    }
  }

  _canUseReactionThisRound(reactionType, roundKey) {
    if (!roundKey) return true;
    const flagKey =
      reactionType === "clash"
        ? COMBAT_FLAG_KEYS.LAST_CLASH_ROUND
        : COMBAT_FLAG_KEYS.LAST_EVASION_ROUND;
    const usedRound = this.getFlag(POKROLE.ID, flagKey);
    return usedRound !== roundKey;
  }

  async _markReactionUsedThisRound(reactionType, roundKey) {
    if (!roundKey) return;
    const flagKey =
      reactionType === "clash"
        ? COMBAT_FLAG_KEYS.LAST_CLASH_ROUND
        : COMBAT_FLAG_KEYS.LAST_EVASION_ROUND;
    await this.setFlag(POKROLE.ID, flagKey, roundKey);
  }

  async _safeApplyDamage(targetActor, damage) {
    const normalizedDamage = Math.max(toNumber(damage, 0), 0);
    if (!targetActor || normalizedDamage <= 0) {
      return null;
    }

    const hpValue = Math.max(toNumber(targetActor.system.resources?.hp?.value, 0), 0);
    const hpAfter = Math.max(hpValue - normalizedDamage, 0);
    try {
      await targetActor.update({ "system.resources.hp.value": hpAfter });
    } catch (error) {
      console.error(`${POKROLE.ID} | Failed to apply damage`, error);
      ui.notifications.warn(game.i18n.localize("POKROLE.Errors.HPUpdateFailed"));
    }

    return {
      hpBefore: hpValue,
      hpAfter
    };
  }

  _evaluateTypeInteraction(moveType, targetActor) {
    if (!moveType || moveType === "none") {
      return {
        immune: false,
        weaknessBonus: 0,
        resistancePenalty: 0,
        label: "POKROLE.Chat.TypeEffect.Neutral"
      };
    }

    const table = TYPE_EFFECTIVENESS[moveType];
    if (!table) {
      return {
        immune: false,
        weaknessBonus: 0,
        resistancePenalty: 0,
        label: "POKROLE.Chat.TypeEffect.Neutral"
      };
    }

    const defenderTypes = [
      targetActor.system.types?.primary,
      targetActor.system.types?.secondary
    ].filter((typeKey) => typeKey && typeKey !== "none");

    let weaknessBonus = 0;
    let resistancePenalty = 0;
    let immune = false;

    for (const defenderType of defenderTypes) {
      if (table.immune.includes(defenderType)) immune = true;
      if (table.double.includes(defenderType)) weaknessBonus += 1;
      if (table.half.includes(defenderType)) resistancePenalty += 1;
    }

    let label = "POKROLE.Chat.TypeEffect.Neutral";
    if (immune) {
      label = "POKROLE.Chat.TypeEffect.Immune";
    } else if (weaknessBonus > resistancePenalty) {
      label = "POKROLE.Chat.TypeEffect.Super";
    } else if (resistancePenalty > weaknessBonus) {
      label = "POKROLE.Chat.TypeEffect.Resisted";
    }

    return {
      immune,
      weaknessBonus,
      resistancePenalty,
      label
    };
  }

  _getTargetDefense(targetActor, category) {
    if (targetActor instanceof PokRoleActor) {
      return targetActor.getDefense(category);
    }

    const fallbackDefense =
      category === "special"
        ? toNumber(targetActor.system?.attributes?.insight, 0)
        : toNumber(targetActor.system?.attributes?.vitality, 0);
    return Math.max(fallbackDefense, 0);
  }

  _resolveDamageAttributeKey(move) {
    const configuredAttribute = move.system.damageAttribute || "auto";
    if (configuredAttribute !== "auto") return configuredAttribute;
    return move.system.category === "special" ? "special" : "strength";
  }

  async _rollSuccessPool({
    dicePool,
    removedSuccesses = 0,
    requiredSuccesses = 1,
    flavor
  }) {
    const normalizedDicePool = Math.max(toNumber(dicePool, 0), 1);
    const roll = await new Roll(successPoolFormula(normalizedDicePool)).evaluate({
      async: true
    });
    const rawSuccesses = toNumber(roll.total, 0);
    const netSuccesses = rawSuccesses - Math.max(toNumber(removedSuccesses, 0), 0);
    const success = netSuccesses >= Math.max(toNumber(requiredSuccesses, 1), 1);
    const resolvedFlavor =
      flavor ??
      game.i18n.format("POKROLE.Chat.GenericRollFlavor", {
        actor: this.name
      });

    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: `${resolvedFlavor}<br><small>${game.i18n.format(
        "POKROLE.Chat.RollBreakdown",
        {
          raw: rawSuccesses,
          removed: removedSuccesses,
          net: netSuccesses,
          required: requiredSuccesses
        }
      )} (${success ? game.i18n.localize("POKROLE.Common.Hit") : game.i18n.localize("POKROLE.Common.Miss")})</small>`
    });

    return {
      roll,
      rawSuccesses,
      netSuccesses,
      requiredSuccesses,
      success
    };
  }
}

export class PokRoleItem extends Item {}
