import {
  COMBAT_FLAG_KEYS,
  MOVE_CATEGORY_LABEL_BY_KEY,
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

function normalizeRoundUsage(data, roundKey) {
  if (!data || typeof data !== "object") {
    return { roundKey, moveIds: [] };
  }

  const resolvedRoundKey =
    typeof data.roundKey === "string" && data.roundKey.length > 0
      ? data.roundKey
      : roundKey;
  const moveIds = Array.isArray(data.moveIds)
    ? data.moveIds.filter((moveId) => typeof moveId === "string")
    : [];

  if (resolvedRoundKey !== roundKey) {
    return { roundKey, moveIds: [] };
  }
  return { roundKey: resolvedRoundKey, moveIds };
}

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
    const skills = Object.keys(this.system.skills ?? {}).map((key) => ({
      key,
      label: this.localizeTrait(key),
      value: this.getSkillValue(key)
    }));

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
        <div class="form-group">
          <label style="display:flex;align-items:center;gap:8px;">
            <input type="checkbox" name="applyPainPenalty" checked />
            <span>${game.i18n.localize("POKROLE.CombinedRoll.ApplyPainPenalty")}</span>
          </label>
        </div>
        <hr />
        <fieldset>
          <legend>${game.i18n.localize("POKROLE.Attributes.Title")}</legend>
          <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;">
            ${attributes
              .map(
                (trait) => `
                  <label style="display:flex;align-items:center;gap:6px;">
                    <input type="checkbox" name="trait" value="${trait.key}" />
                    <span>${trait.label} (${trait.value})</span>
                  </label>
                `
              )
              .join("")}
          </div>
        </fieldset>
        <fieldset style="margin-top:8px;">
          <legend>${game.i18n.localize("POKROLE.Skills.Title")}</legend>
          <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;">
            ${skills
              .map(
                (trait) => `
                  <label style="display:flex;align-items:center;gap:6px;">
                    <input type="checkbox" name="trait" value="${trait.key}" />
                    <span>${trait.label} (${trait.value})</span>
                  </label>
                `
              )
              .join("")}
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
      }).render(true);
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

  async rollInitiative() {
    const roll = await new Roll(POKROLE.INITIATIVE_FORMULA, {
      dexterity: this.getTraitValue("dexterity"),
      alert: this.getSkillValue("alert")
    }).evaluate({ async: true });

    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: game.i18n.format("POKROLE.Chat.InitiativeFlavor", {
        actor: this.name,
        score: this.getInitiativeScore()
      })
    });

    return roll;
  }

  async rollEvasion(actionNumber = this.system.combat?.actionNumber ?? 1, options = {}) {
    const roundKey = options.roundKey ?? getCurrentCombatRoundKey();
    if (!options.ignoreRoundLimit && !this._canUseReactionThisRound("evasion", roundKey)) {
      ui.notifications.warn(game.i18n.localize("POKROLE.Errors.EvasionAlreadyUsedThisRound"));
      return null;
    }

    const normalizedAction = clamp(toNumber(actionNumber, 1), 1, 5);
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
    return result;
  }

  async rollClash(moveId, actionNumber = this.system.combat?.actionNumber ?? 1, options = {}) {
    if (this.type !== "pokemon") return null;

    const roundKey = options.roundKey ?? getCurrentCombatRoundKey();
    if (!options.ignoreRoundLimit && !this._canUseReactionThisRound("clash", roundKey)) {
      ui.notifications.warn(game.i18n.localize("POKROLE.Errors.ClashAlreadyUsedThisRound"));
      return null;
    }
    if (this._isMoveUsedThisRound(moveId, roundKey)) {
      ui.notifications.warn(game.i18n.localize("POKROLE.Errors.MoveAlreadyUsedThisRound"));
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
    const normalizedAction = clamp(toNumber(actionNumber, 1), 1, 5);
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

    await this._markMoveUsedThisRound(moveId, roundKey);
    if (!options.ignoreRoundLimit) {
      await this._markReactionUsedThisRound("clash", roundKey);
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
    if (this._isMoveUsedThisRound(move.id, roundKey)) {
      ui.notifications.warn(game.i18n.localize("POKROLE.Errors.MoveAlreadyUsedThisRound"));
      return null;
    }

    const actionNumber = clamp(
      toNumber(options.actionNumber, this.system.combat?.actionNumber ?? 1),
      1,
      5
    );
    const painPenalty = this.getPainPenalty();
    const accuracyAttributeKey = move.system.accuracyAttribute || "dexterity";
    const accuracySkillKey = move.system.accuracySkill || "brawl";
    const accuracyDicePool =
      this.getTraitValue(accuracyAttributeKey) + this.getSkillValue(accuracySkillKey);

    if (Number.isNaN(accuracyDicePool)) {
      ui.notifications.warn(game.i18n.localize("POKROLE.Errors.UnknownMoveTraits"));
      return null;
    }

    await this._markMoveUsedThisRound(move.id, roundKey);

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

    const targetActor = getTargetActorFromUserSelection();
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

    if (hit && isDamagingMove && targetActor) {
      reaction = await this._resolveDefensiveReaction({
        targetActor,
        move,
        roundKey,
        reactionActionNumber: clamp(
          toNumber(targetActor.system.combat?.actionNumber, 1),
          1,
          5
        ),
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

    if (hit && isDamagingMove && !reaction.clashResolved) {
      const damageAttributeKey = this._resolveDamageAttributeKey(move);
      damageAttributeLabel = this.localizeTrait(damageAttributeKey);
      const damageAttributeValue = Math.max(this.getTraitValue(damageAttributeKey), 0);
      const power = Math.max(toNumber(move.system.power, 0), 0);
      const damagePainPenalty = damageAttributeKey === "vitality" ? 0 : painPenalty;

      stabDice = this.hasType(moveType) ? 1 : 0;
      defense = targetActor ? this._getTargetDefense(targetActor, category) : 0;
      poolBeforeDefense = damageAttributeValue + power + stabDice + criticalDice - damagePainPenalty;
      damagePool = Math.max(poolBeforeDefense - defense, 0);

      if (targetActor) {
        typeInteraction = this._evaluateTypeInteraction(moveType, targetActor);
      }

      if (damagePool > 0) {
        damageRoll = await new Roll(successPoolFormula(damagePool)).evaluate({ async: true });
        damageSuccesses = toNumber(damageRoll.total, 0);
        await damageRoll.toMessage({
          speaker: ChatMessage.getSpeaker({ actor: this }),
          flavor: game.i18n.format("POKROLE.Chat.MoveDamageFlavor", {
            actor: this.name,
            move: move.name
          })
        });
      }

      let baseDamage = Math.max(damageSuccesses, 1);
      if (typeInteraction.immune) {
        finalDamage = 0;
      } else {
        const weaknessBonus =
          damageSuccesses >= 1 ? typeInteraction.weaknessBonus : 0;
        finalDamage = Math.max(
          baseDamage + weaknessBonus - typeInteraction.resistancePenalty,
          0
        );
      }

      if (targetActor && finalDamage > 0) {
        const hpChange = await this._safeApplyDamage(targetActor, finalDamage);
        hpBefore = hpChange?.hpBefore ?? null;
        hpAfter = hpChange?.hpAfter ?? null;
      }
    }

    const summaryHtml = await renderTemplate(
      "systems/pok-role-module/templates/chat/move-roll.hbs",
      {
        actorName: this.name,
        moveName: move.name,
        moveTypeLabel: this.localizeTrait(moveType),
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
        hasHpUpdate: hpAfter !== null && hpBefore !== null,
        hpBefore,
        hpAfter
      }
    );

    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      content: summaryHtml
    });

    return {
      accuracyRoll,
      damageRoll,
      hit,
      critical,
      reaction,
      finalDamage
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
    reactionActionNumber,
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
      const evasionResult = await targetActor.rollEvasion(reactionActionNumber, { roundKey });
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
      const clashResult = await targetActor.rollClash(choice.clashMoveId, reactionActionNumber, {
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
      .filter((item) => item.type === "move" && item.system.category !== "support")
      .filter((item) => !targetActor._isMoveUsedThisRound(item.id, roundKey));
    const canUseClash =
      moveCanBeClashed &&
      targetActor._canUseReactionThisRound("clash", roundKey) &&
      clashMoves.length > 0;

    if (!canUseEvasion && !canUseClash) {
      return { type: "none" };
    }

    const content = `
      <form class="pok-role-reaction-dialog">
        <p>
          ${game.i18n.format("POKROLE.Combat.ReactionPrompt", {
            target: targetActor.name,
            move: move.name
          })}
        </p>
        <label style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
          <input type="radio" name="reactionType" value="none" checked />
          <span>${game.i18n.localize("POKROLE.Chat.Reaction.None")}</span>
        </label>
        ${
          canUseEvasion
            ? `
          <label style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
            <input type="radio" name="reactionType" value="evasion" />
            <span>${game.i18n.localize("POKROLE.Chat.Reaction.UseEvasion")}</span>
          </label>
        `
            : ""
        }
        ${
          canUseClash
            ? `
          <label style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
            <input type="radio" name="reactionType" value="clash" />
            <span>${game.i18n.localize("POKROLE.Chat.Reaction.UseClash")}</span>
          </label>
          <div class="form-group" style="margin-left:22px;">
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
      }).render(true);
    });

    if (!html) return { type: "none" };
    const form = html[0]?.querySelector("form");
    if (!form) return { type: "none" };

    const type = form.querySelector("input[name='reactionType']:checked")?.value ?? "none";
    const clashMoveId = form.querySelector("select[name='clashMoveId']")?.value ?? "";
    return { type, clashMoveId };
  }

  _computeClashDamage(moveType, targetActor) {
    const interaction = this._evaluateTypeInteraction(moveType, targetActor);
    if (interaction.immune) return 0;
    return Math.max(1 + interaction.weaknessBonus - interaction.resistancePenalty, 0);
  }

  _isSocialAccuracyMove(move) {
    return SOCIAL_ATTRIBUTE_KEYS.includes(move.system.accuracyAttribute);
  }

  _getRoundUsage(roundKey) {
    if (!roundKey) return { roundKey: "", moveIds: [] };
    const current = this.getFlag(POKROLE.ID, COMBAT_FLAG_KEYS.ROUND_USAGE);
    return normalizeRoundUsage(current, roundKey);
  }

  _isMoveUsedThisRound(moveId, roundKey) {
    if (!roundKey) return false;
    const usage = this._getRoundUsage(roundKey);
    return usage.moveIds.includes(moveId);
  }

  async _markMoveUsedThisRound(moveId, roundKey) {
    if (!roundKey) return;
    const usage = this._getRoundUsage(roundKey);
    if (usage.moveIds.includes(moveId)) return;
    usage.moveIds.push(moveId);
    await this.setFlag(POKROLE.ID, COMBAT_FLAG_KEYS.ROUND_USAGE, usage);
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
