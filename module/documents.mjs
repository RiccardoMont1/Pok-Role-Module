import {
  MOVE_CATEGORY_LABEL_BY_KEY,
  POKROLE,
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

  async rollEvasion(actionNumber = this.system.combat?.actionNumber ?? 1) {
    const normalizedAction = clamp(toNumber(actionNumber, 1), 1, 5);
    return this._rollSuccessPool({
      dicePool: this.getTraitValue("dexterity") + this.getSkillValue("evasion"),
      removedSuccesses: this.getPainPenalty(),
      requiredSuccesses: normalizedAction,
      flavor: game.i18n.format("POKROLE.Chat.EvasionFlavor", {
        actor: this.name,
        required: normalizedAction
      })
    });
  }

  async rollClash(moveId, actionNumber = this.system.combat?.actionNumber ?? 1) {
    if (this.type !== "pokemon") return null;

    const move = this.items.get(moveId);
    if (!move || move.type !== "move") {
      ui.notifications.warn(game.i18n.localize("POKROLE.Errors.UnknownMove"));
      return null;
    }

    const damageAttributeKey = this._resolveDamageAttributeKey(move);
    const normalizedAction = clamp(toNumber(actionNumber, 1), 1, 5);
    const removedSuccesses = hasPainPenaltyException(damageAttributeKey, "clash")
      ? 0
      : this.getPainPenalty();

    return this._rollSuccessPool({
      dicePool: this.getTraitValue(damageAttributeKey) + this.getSkillValue("clash"),
      removedSuccesses,
      requiredSuccesses: normalizedAction,
      flavor: game.i18n.format("POKROLE.Chat.ClashFlavor", {
        actor: this.name,
        move: move.name,
        required: normalizedAction
      })
    });
  }

  async rollMove(moveId, options = {}) {
    if (this.type !== "pokemon") return null;

    const move = this.items.get(moveId);
    if (!move || move.type !== "move") {
      ui.notifications.warn(game.i18n.localize("POKROLE.Errors.UnknownMove"));
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

    const reducedAccuracy = Math.max(toNumber(move.system.reducedAccuracy, 0), 0);
    const accuracyRoll = await new Roll(successPoolFormula(accuracyDicePool)).evaluate({
      async: true
    });
    const rawAccuracySuccesses = toNumber(accuracyRoll.total, 0);
    const removedAccuracySuccesses = reducedAccuracy + painPenalty;
    const netAccuracySuccesses = rawAccuracySuccesses - removedAccuracySuccesses;
    const requiredSuccesses = actionNumber;
    const hit = netAccuracySuccesses >= requiredSuccesses;
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
    let damageRoll = null;
    let damageSuccesses = 0;
    let finalDamage = 0;
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

    if (hit && isDamagingMove) {
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
        hpBefore = Math.max(toNumber(targetActor.system.resources?.hp?.value, 0), 0);
        hpAfter = Math.max(hpBefore - finalDamage, 0);
        try {
          await targetActor.update({ "system.resources.hp.value": hpAfter });
        } catch (error) {
          console.error(`${POKROLE.ID} | Failed to apply damage`, error);
          ui.notifications.warn(game.i18n.localize("POKROLE.Errors.HPUpdateFailed"));
        }
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
        isDamagingMove,
        showDamageSection: hit && isDamagingMove,
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
