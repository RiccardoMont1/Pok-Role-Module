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

      const baseDamage = Math.max(damageSuccesses, 1);
      if (typeInteraction.immune) {
        finalDamage = 0;
      } else {
        const weaknessBonus =
          damageSuccesses >= 1 ? typeInteraction.weaknessBonus : 0;
        const resolvedDamage = Math.max(
          baseDamage + weaknessBonus - typeInteraction.resistancePenalty,
          1
        );
        finalDamage = isHoldingBackHalf
          ? Math.max(Math.floor(resolvedDamage / 2), 1)
          : resolvedDamage;
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
      finalDamage
    };

    if (options.advanceAction !== false) {
      await this._advanceActionCounter(actionNumber, roundKey);
    }

    return result;
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
        content: `<p>${game.i18n.format("POKROLE.Combat.HoldingBackPrompt", {
          move: move.name
        })}</p>`,
        buttons,
        default: "normal",
        close: () => resolve("none")
      }).render(true);
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
