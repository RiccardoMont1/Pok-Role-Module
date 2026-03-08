import {
  ATTRIBUTE_DEFINITIONS,
  MOVE_CATEGORY_LABEL_BY_KEY,
  MOVE_TYPE_LABEL_BY_KEY,
  POKEMON_TIER_LABEL_BY_KEY,
  SKILL_DEFINITIONS,
  TRAINER_CARD_RANK_LABEL_BY_KEY,
  TRAIT_LABEL_BY_KEY,
  TYPE_EFFECTIVENESS,
  TYPE_OPTIONS
} from "../constants.mjs";

const TEMPLATE_BY_TYPE = Object.freeze({
  trainer: "systems/pok-role-module/templates/actor/trainer-sheet.hbs",
  pokemon: "systems/pok-role-module/templates/actor/pokemon-sheet.hbs"
});

export class PokRoleActorSheet extends foundry.appv1.sheets.ActorSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["pok-role", "sheet", "actor"],
      width: 1000,
      height: 860,
      submitOnClose: true,
      submitOnChange: true,
      resizable: true
    });
  }

  setPosition(options = {}) {
    if (this.actor?.type === "trainer") {
      const currentPosition = this.position ?? {};
      const baseWidth = Number(options.width ?? currentPosition.width ?? this.options.width ?? 1000);
      const baseHeight = Number(options.height ?? currentPosition.height ?? this.options.height ?? 860);
      options.width = Math.min(Math.max(baseWidth, 680), 1000);
      options.height = Math.max(baseHeight, 600);
    }
    return super.setPosition(options);
  }

  get template() {
    return TEMPLATE_BY_TYPE[this.actor.type] || TEMPLATE_BY_TYPE.trainer;
  }

  async getData(options = {}) {
    const context = await super.getData(options);
    context.system = this.actor.system;
    context.attributeDefinitions = ATTRIBUTE_DEFINITIONS.map((attribute) => ({
      ...attribute,
      value: Number(this.actor.system.attributes?.[attribute.key] ?? 0),
      track: this._buildTrack(this.actor.system.attributes?.[attribute.key], 5, 0)
    }));
    context.skillDefinitions = SKILL_DEFINITIONS.map((skill) => ({
      ...skill,
      value: Number(this.actor.system.skills?.[skill.key] ?? 0),
      track: this._buildTrack(this.actor.system.skills?.[skill.key], 5, 0)
    }));
    context.initiativeScore = Number(this.actor.system.combat?.initiative ?? 0);
    context.baseInitiativeScore = this.actor.getInitiativeScore();
    context.defense = this.actor.getDefense("physical");
    context.specialDefense = this.actor.getDefense("special");
    context.painPenalty = this.actor.getPainPenalty();
    context.actionTrack = this._buildTrack(this.actor.system.combat?.actionNumber, 5, 1);
    context.badgesTrack = this._buildTrack(this.actor.system.badges, 8, 0);
    context.trainerRankOptions = TRAINER_CARD_RANK_LABEL_BY_KEY;
    const extraSkills = Array.isArray(this.actor.system.extraSkills)
      ? this.actor.system.extraSkills
      : [];
    context.extraSkills = extraSkills.map((extraSkill, index) => ({
      index,
      name: `${extraSkill?.name ?? ""}`,
      value: Number(extraSkill?.value ?? 0),
      track: this._buildTrack(extraSkill?.value, 5, 0)
    }));
    context.typeOptions = Object.fromEntries(
      TYPE_OPTIONS.map((typeKey) => [
        typeKey,
        typeKey === "none"
          ? "POKROLE.Types.None"
          : MOVE_TYPE_LABEL_BY_KEY[typeKey] ?? "POKROLE.Common.Unknown"
      ])
    );
    context.pokemonTierOptions = POKEMON_TIER_LABEL_BY_KEY;
    if (this.actor.type === "trainer") {
      context.trainerPhysicalMentalAttributes = this._buildAttributeRows([
        "strength",
        "vitality",
        "dexterity",
        "insight",
        "special"
      ]);
      context.trainerSocialAttributes = this._buildAttributeRows([
        "tough",
        "beauty",
        "cool",
        "cute",
        "clever",
        "allure"
      ]);
    }
    if (this.actor.type === "pokemon") {
      const trackMax = this._getPokemonTrackMaxConfig();
      const pokemonSkillKeys = [
        "brawl",
        "channel",
        "clash",
        "evasion",
        "alert",
        "athletic",
        "nature",
        "stealth",
        "etiquette",
        "intimidate",
        "perform"
      ];
      context.pokemonPhysicalMentalRows = this._buildAttributeRows([
        "strength",
        "vitality",
        "dexterity",
        "insight",
        "special"
      ], trackMax.attributes);
      context.pokemonSocialRows = this._buildAttributeRows([
        "tough",
        "beauty",
        "cool",
        "cute",
        "clever",
        "allure"
      ], trackMax.attributes);
      context.pokemonSkillRows = this._buildSkillRows(pokemonSkillKeys, trackMax.skills);
      context.pokemonExtraTrack = this._buildTrack(this.actor.system.extra, trackMax.extra, 0);
      context.pokemonMatchups = this._buildPokemonMatchups();
      context.pokemonTrackSettingAttributes = [
        ...context.pokemonPhysicalMentalRows,
        ...context.pokemonSocialRows
      ].map((row) => ({
        key: row.key,
        label: row.label,
        fieldPath: `system.sheetSettings.trackMax.attributes.${row.key}`,
        value: trackMax.attributes?.[row.key] ?? 5
      }));
      context.pokemonTrackSettingSkills = context.pokemonSkillRows.map((row) => ({
        key: row.key,
        label: row.label,
        fieldPath: `system.sheetSettings.trackMax.skills.${row.key}`,
        value: trackMax.skills?.[row.key] ?? 5
      }));
      context.pokemonTrackSettingExtra = {
        fieldPath: "system.sheetSettings.trackMax.extra",
        value: trackMax.extra
      };
      context.evolutionTimeOptions = {
        fast: "POKROLE.Pokemon.EvolutionFast",
        medium: "POKROLE.Pokemon.EvolutionMedium",
        slow: "POKROLE.Pokemon.EvolutionSlow"
      };
      const evolutionThresholdByTime = { fast: 5, medium: 15, slow: 45 };
      const evolutionTimeKey = `${this.actor.system.evolutionTime ?? "medium"}`.toLowerCase();
      context.evolutionThreshold = evolutionThresholdByTime[evolutionTimeKey] ?? 15;
      context.evolutionProgressValue = Math.max(Number(this.actor.system.victories ?? 0), 0);
      context.evolutionReady = context.evolutionProgressValue >= context.evolutionThreshold;
    }
    const moves = this.actor.items
      .filter((item) => item.type === "move")
      .sort((a, b) => a.sort - b.sort)
      .map((move) => this._prepareMoveData(move));
    context.moves = moves;
    if (this.actor.type === "pokemon") {
      const insightValue = Math.max(Number(this.actor.system.attributes?.insight ?? 0), 0);
      context.maxUsableMoves = insightValue + 2;
      context.usableMoves = moves.filter((move) => move.isUsable);
      context.learnedMoves = moves;
      context.usableMovesCount = context.usableMoves.length;
      context.pokemonView = this._normalizePokemonView(this._pokemonActiveView ?? "main");
    }
    const pocketOrder = {
      potions: 0,
      small: 1,
      main: 2,
      badge: 3,
      held: 4
    };
    const gearItems = this.actor.items
      .filter((item) => item.type === "gear")
      .sort((a, b) => {
        const aPocketOrder = pocketOrder[a.system.pocket] ?? 99;
        const bPocketOrder = pocketOrder[b.system.pocket] ?? 99;
        if (aPocketOrder !== bPocketOrder) return aPocketOrder - bPocketOrder;
        if (a.sort !== b.sort) return a.sort - b.sort;
        return `${a.name}`.localeCompare(`${b.name}`);
      })
      .map((gear) => this._prepareGearData(gear));
    context.gearItems = gearItems;
    context.gearBattleItems = gearItems.filter((gear) => gear.usableInBattle);
    context.gearFieldItems = gearItems.filter((gear) => !gear.usableInBattle);
    return context;
  }

  activateListeners(html) {
    super.activateListeners(html);
    const appElement = html.closest(".app");
    if (appElement?.length) {
      appElement.toggleClass("pok-role-pokemon-window", this.actor.type === "pokemon");
      appElement.toggleClass("pok-role-trainer-window", this.actor.type === "trainer");
    }

    html.find("[data-action='roll-attribute']").on("click", (event) =>
      this._onRollAttribute(event)
    );
    html.find("[data-action='roll-skill']").on("click", (event) =>
      this._onRollSkill(event)
    );
    html.find("[data-action='roll-initiative']").on("click", () =>
      this.actor.rollInitiative()
    );
    html.find("[data-action='roll-combined']").on("click", () =>
      this.actor.rollCombinedDialog()
    );
    html.find("[data-action='reset-action-counter']").on("click", () =>
      this.actor.resetActionCounter()
    );
    html.find("[data-action='roll-evasion']").on("click", () => this.actor.rollEvasion());
    html.find("[data-action='set-track']").on("click", (event) => this._onSetTrack(event));
    html.find("[data-action='add-extra-skill']").on("click", (event) =>
      this._onAddExtraSkill(event)
    );
    html.find("[data-action='delete-extra-skill']").on("click", (event) =>
      this._onDeleteExtraSkill(event)
    );

    html.find("[data-action='create-move']").on("click", (event) =>
      this._onCreateMove(event)
    );
    html.find("[data-action='edit-move']").on("click", (event) =>
      this._onEditMove(event)
    );
    html.find("[data-action='roll-move']").on("click", (event) =>
      this._onRollMove(event)
    );
    html.find("[data-action='roll-clash']").on("click", (event) =>
      this._onRollClash(event)
    );
    html.find("[data-action='delete-move']").on("click", (event) =>
      this._onDeleteMove(event)
    );
    html.find("[data-action='create-gear']").on("click", (event) =>
      this._onCreateGear(event)
    );
    html.find("[data-action='edit-gear']").on("click", (event) =>
      this._onEditGear(event)
    );
    html.find("[data-action='use-gear']").on("click", (event) =>
      this._onUseGear(event)
    );
    html.find("[data-action='delete-gear']").on("click", (event) =>
      this._onDeleteGear(event)
    );
    html.find("[data-action='toggle-move-usable']").on("change", (event) =>
      this._onToggleMoveUsable(event)
    );
    html.find("[data-action='switch-pokemon-tab']").on("click", (event) =>
      this._onSwitchPokemonTab(event, html)
    );
    html.find("[data-action='evolution-available']").on("click", (event) =>
      this._onEvolutionAvailable(event)
    );

    if (this.actor.type === "pokemon") {
      this._applyPokemonTabState(html, this._pokemonActiveView ?? "main");
    }
  }

  async _onRollAttribute(event) {
    event.preventDefault();
    const { attribute } = event.currentTarget.dataset;
    if (!attribute) return;
    await this.actor.rollAttribute(attribute);
  }

  async _onRollSkill(event) {
    event.preventDefault();
    const { skill } = event.currentTarget.dataset;
    if (!skill) return;
    await this.actor.rollSkill(skill);
  }

  async _onCreateMove(event) {
    event.preventDefault();
    if (!this.isEditable || this.actor.type !== "pokemon") return;
    const insightValue = Math.max(Number(this.actor.system.attributes?.insight ?? 0), 0);
    const maxUsableMoves = insightValue + 2;
    const usableMovesCount = this.actor.items.filter(
      (item) => item.type === "move" && item.system?.isUsable !== false
    ).length;
    const canMarkUsable = usableMovesCount < maxUsableMoves;

    await this.actor.createEmbeddedDocuments("Item", [
      {
        name: game.i18n.localize("POKROLE.Move.New"),
        type: "move",
        img: "icons/svg/sword.svg",
        system: {
          type: "normal",
          category: "physical",
          accuracyAttribute: "dexterity",
          accuracySkill: "brawl",
          reducedAccuracy: 0,
          power: 2,
          damageAttribute: "auto",
          priority: 0,
          highCritical: false,
          neverFail: false,
          lethal: false,
          actionTag: "1A",
          isUsable: canMarkUsable
        }
      }
    ]);
  }

  async _onEditMove(event) {
    event.preventDefault();
    const { itemId } = event.currentTarget.dataset;
    if (!itemId) return;

    const move = this.actor.items.get(itemId);
    move?.sheet.render(true);
  }

  async _onRollMove(event) {
    event.preventDefault();
    const { itemId } = event.currentTarget.dataset;
    if (!itemId) return;
    await this.actor.rollMove(itemId);
  }

  async _onRollClash(event) {
    event.preventDefault();
    const { itemId } = event.currentTarget.dataset;
    if (!itemId) return;
    await this.actor.rollClash(itemId);
  }

  async _onDeleteMove(event) {
    event.preventDefault();
    if (!this.isEditable) return;

    const { itemId } = event.currentTarget.dataset;
    if (!itemId) return;
    await this.actor.deleteEmbeddedDocuments("Item", [itemId]);
  }

  async _onToggleMoveUsable(event) {
    event.preventDefault();
    if (!this.isEditable || this.actor.type !== "pokemon") return;

    const checkbox = event.currentTarget;
    const { itemId } = checkbox.dataset;
    if (!itemId) return;

    const move = this.actor.items.get(itemId);
    if (!move || move.type !== "move") return;

    const nextValue = Boolean(checkbox.checked);
    const currentValue = move.system?.isUsable !== false;
    if (nextValue === currentValue) return;

    if (nextValue) {
      const insightValue = Math.max(Number(this.actor.system.attributes?.insight ?? 0), 0);
      const maxUsableMoves = insightValue + 2;
      const usableMovesCount = this.actor.items.filter(
        (item) => item.type === "move" && item.system?.isUsable !== false
      ).length;

      if (usableMovesCount >= maxUsableMoves) {
        checkbox.checked = false;
        ui.notifications.warn(
          game.i18n.format("POKROLE.Errors.MaxUsableMovesReached", { max: maxUsableMoves })
        );
        return;
      }
    }

    await move.update({ "system.isUsable": nextValue });
  }

  _onSwitchPokemonTab(event, html) {
    event.preventDefault();
    if (this.actor.type !== "pokemon") return;

    const tab = event.currentTarget.dataset.tab;
    if (!tab) return;
    this._pokemonActiveView = this._normalizePokemonView(tab);
    this._applyPokemonTabState(html, this._pokemonActiveView);
  }

  _onEvolutionAvailable(event) {
    event.preventDefault();
    if (this.actor.type !== "pokemon") return;
    ui.notifications.info(
      game.i18n.format("POKROLE.Pokemon.EvolutionAvailableNotice", { name: this.actor.name })
    );
  }

  async _onCreateGear(event) {
    event.preventDefault();
    if (!this.isEditable || this.actor.type !== "trainer") return;

    await this.actor.createEmbeddedDocuments("Item", [
      {
        name: game.i18n.localize("POKROLE.Gear.New"),
        type: "gear",
        img: "icons/svg/item-bag.svg",
        system: {
          category: "healing",
          pocket: "potions",
          consumable: true,
          canUseInBattle: true,
          target: "pokemon",
          quantity: 1,
          units: {
            value: 2,
            max: 2
          },
          heal: {
            hp: 1,
            lethal: 0,
            fullHp: false,
            restoreAwareness: false
          },
          status: {
            all: false,
            poison: false,
            sleep: false,
            burn: false,
            frozen: false,
            paralysis: false,
            confusion: false
          },
          description: ""
        }
      }
    ]);
  }

  async _onEditGear(event) {
    event.preventDefault();
    const { itemId } = event.currentTarget.dataset;
    if (!itemId) return;
    const gear = this.actor.items.get(itemId);
    gear?.sheet.render(true);
  }

  async _onUseGear(event) {
    event.preventDefault();
    const { itemId } = event.currentTarget.dataset;
    if (!itemId) return;
    await this.actor.useGearItem(itemId);
  }

  async _onDeleteGear(event) {
    event.preventDefault();
    if (!this.isEditable) return;
    const { itemId } = event.currentTarget.dataset;
    if (!itemId) return;
    await this.actor.deleteEmbeddedDocuments("Item", [itemId]);
  }

  async _onAddExtraSkill(event) {
    event.preventDefault();
    if (!this.isEditable || this.actor.type !== "trainer") return;
    const current = Array.isArray(this.actor.system.extraSkills)
      ? foundry.utils.deepClone(this.actor.system.extraSkills)
      : [];
    current.push({ name: "", value: 0 });
    await this.actor.update({ "system.extraSkills": current });
  }

  async _onDeleteExtraSkill(event) {
    event.preventDefault();
    if (!this.isEditable || this.actor.type !== "trainer") return;
    const extraIndex = Number(event.currentTarget.dataset.extraIndex);
    if (!Number.isInteger(extraIndex) || extraIndex < 0) return;
    const current = Array.isArray(this.actor.system.extraSkills)
      ? foundry.utils.deepClone(this.actor.system.extraSkills)
      : [];
    if (extraIndex >= current.length) return;
    current.splice(extraIndex, 1);
    await this.actor.update({ "system.extraSkills": current });
  }

  async _onSetTrack(event) {
    event.preventDefault();
    if (!this.isEditable) return;

    const button = event.currentTarget;
    const field = button.dataset.trackField;
    const value = Number(button.dataset.trackValue);
    const min = Number(button.dataset.trackMin ?? 1);
    const max = Number(button.dataset.trackMax ?? 5);
    if (!field || !Number.isFinite(value) || !Number.isFinite(min) || !Number.isFinite(max)) {
      return;
    }

    const systemPath = field.startsWith("system.") ? field.slice(7) : field;
    const currentValue = Number(foundry.utils.getProperty(this.actor.system, systemPath) ?? min);
    let nextValue = value;

    if (min === 0 && currentValue === value) {
      nextValue = value - 1;
    }

    nextValue = Math.min(Math.max(nextValue, min), max);
    await this.actor.update({ [field]: nextValue });
  }

  _prepareMoveData(move) {
    const category = move.system.category || "physical";
    const moveType = move.system.type || "normal";
    const reducedAccuracy = Number(move.system.reducedAccuracy ?? 0);
    const categoryLabel = game.i18n.localize(
      MOVE_CATEGORY_LABEL_BY_KEY[category] ?? "POKROLE.Common.Unknown"
    );
    const typeLabel = game.i18n.localize(
      MOVE_TYPE_LABEL_BY_KEY[moveType] ?? "POKROLE.Common.Unknown"
    );
    const accuracyLabel = [
      this._localizeTrait(move.system.accuracyAttribute),
      this._localizeTrait(move.system.accuracySkill)
    ].join(" + ");
    const accuracySummary =
      reducedAccuracy > 0 ? `${accuracyLabel} (-${reducedAccuracy})` : accuracyLabel;

    const damageAttribute = this._resolveDamageAttributeForDisplay(move.system);
    const damageSummary =
      category === "support"
        ? game.i18n.localize("POKROLE.Move.SupportNoDamage")
        : `${this._localizeTrait(damageAttribute)} + ${Number(move.system.power ?? 0)}`;

    const flags = [];
    if (move.system.highCritical) flags.push(game.i18n.localize("POKROLE.Move.HighCritical"));
    if (move.system.neverFail) flags.push(game.i18n.localize("POKROLE.Move.NeverFail"));
    if (move.system.lethal) flags.push(game.i18n.localize("POKROLE.Move.Lethal"));
    const priority = Number(move.system.priority ?? 0);
    if (priority !== 0) {
      flags.push(
        game.i18n.format("POKROLE.Move.PriorityWithValue", {
          value: priority > 0 ? `+${priority}` : `${priority}`
        })
      );
    }
    const isUsable = move.system?.isUsable !== false;
    const actionTag = this._normalizeMoveActionTag(move.system?.actionTag);
    const actionTagLabel = game.i18n.localize(
      `POKROLE.Move.ActionTagValues.${actionTag}`
    );

    return {
      id: move.id,
      name: move.name,
      img: move.img,
      isUsable,
      actionTag,
      actionTagShort: actionTag,
      actionTagLabel,
      categoryLabel,
      typeLabel,
      accuracySummary,
      damageSummary,
      flagsSummary:
        flags.length > 0
          ? flags.join(", ")
          : game.i18n.localize("POKROLE.Common.None"),
      system: move.system
    };
  }

  _localizeTrait(traitKey) {
    const path = TRAIT_LABEL_BY_KEY[traitKey] ?? "POKROLE.Common.Unknown";
    return game.i18n.localize(path);
  }

  _resolveDamageAttributeForDisplay(moveSystem) {
    const damageAttribute = moveSystem.damageAttribute || "auto";
    if (damageAttribute !== "auto") return damageAttribute;
    return moveSystem.category === "special" ? "special" : "strength";
  }

  _prepareGearData(gear) {
    const pocketKey = `${gear.system.pocket ?? "main"}`.toLowerCase();
    const categoryLabel = game.i18n.localize(
      `POKROLE.Gear.Category.${this._toTitleCaseKey(gear.system.category)}`
    );
    const pocketLabel = game.i18n.localize(
      `POKROLE.Gear.Pocket.${this._toTitleCaseKey(pocketKey)}`
    );
    const pocketAllowsBattle = pocketKey === "potions" || pocketKey === "small";
    const usableInBattle = pocketAllowsBattle && Boolean(gear.system.canUseInBattle);

    const quantity = Number(gear.system.quantity ?? 0);
    const unitsValue = Number(gear.system.units?.value ?? 0);
    const unitsMax = Number(gear.system.units?.max ?? 0);
    const stockLabel =
      unitsMax > 0 ? `${quantity} x (${unitsValue}/${unitsMax})` : `${quantity}`;

    const effects = [];
    if (gear.system.heal?.fullHp) {
      effects.push(game.i18n.localize("POKROLE.Gear.FullHp"));
    } else if (Number(gear.system.heal?.hp ?? 0) > 0) {
      effects.push(
        game.i18n.format("POKROLE.Gear.HealHpShort", {
          value: Number(gear.system.heal.hp ?? 0)
        })
      );
    }
    if (Number(gear.system.heal?.lethal ?? 0) > 0) {
      effects.push(
        game.i18n.format("POKROLE.Gear.HealLethalShort", {
          value: Number(gear.system.heal.lethal ?? 0)
        })
      );
    }
    if (gear.system.heal?.restoreAwareness) {
      effects.push(game.i18n.localize("POKROLE.Gear.RestoreAwareness"));
    }
    if (gear.system.status?.all) {
      effects.push(game.i18n.localize("POKROLE.Gear.Status.All"));
    }

    const statusKeys = ["poison", "sleep", "burn", "frozen", "paralysis", "confusion"];
    const statusLabels = statusKeys
      .filter((statusKey) => gear.system.status?.[statusKey])
      .map((statusKey) =>
        game.i18n.localize(`POKROLE.Gear.Status.${this._toTitleCaseKey(statusKey)}`)
      );
    if (statusLabels.length > 0) {
      effects.push(statusLabels.join(", "));
    }

    return {
      id: gear.id,
      name: gear.name,
      img: gear.img,
      categoryLabel,
      pocketLabel,
      pocketKey,
      stockLabel,
      canUseInBattle: gear.system.canUseInBattle,
      usableInBattle,
      consumable: gear.system.consumable,
      effectsSummary:
        effects.length > 0 ? effects.join(" | ") : game.i18n.localize("POKROLE.Common.None")
    };
  }

  _normalizeMoveActionTag(actionTag) {
    const normalized = `${actionTag ?? "1A"}`.trim().toUpperCase();
    if (normalized === "2A" || normalized === "5A") return normalized;
    return "1A";
  }

  _buildAttributeRows(attributeKeys, trackMaxByKey = null) {
    return attributeKeys.map((attributeKey) => {
      const value = Number(this.actor.system.attributes?.[attributeKey] ?? 0);
      const maxValue = this._resolveTrackMax(trackMaxByKey?.[attributeKey], 5);
      return {
        key: attributeKey,
        label: TRAIT_LABEL_BY_KEY[attributeKey] ?? "POKROLE.Common.Unknown",
        value,
        fieldPath: `system.attributes.${attributeKey}`,
        track: this._buildTrack(value, maxValue, 0)
      };
    });
  }

  _buildSkillRows(skillKeys, trackMaxByKey = null) {
    return skillKeys.map((skillKey) => {
      const value = Number(this.actor.system.skills?.[skillKey] ?? 0);
      const maxValue = this._resolveTrackMax(trackMaxByKey?.[skillKey], 5);
      return {
        key: skillKey,
        label: TRAIT_LABEL_BY_KEY[skillKey] ?? "POKROLE.Common.Unknown",
        value,
        fieldPath: `system.skills.${skillKey}`,
        track: this._buildTrack(value, maxValue, 0)
      };
    });
  }

  _buildTrack(currentValue, maxValue, minValue = 1) {
    const numericCurrent = Number(currentValue);
    const normalizedCurrent = Number.isFinite(numericCurrent) ? numericCurrent : minValue;
    const clampedCurrent = Math.min(Math.max(normalizedCurrent, minValue), maxValue);
    const slots = [];
    for (let slotValue = 1; slotValue <= maxValue; slotValue += 1) {
      slots.push({
        value: slotValue,
        active: slotValue <= clampedCurrent
      });
    }
    return {
      min: minValue,
      max: maxValue,
      value: clampedCurrent,
      slots,
      style: `--track-columns:${maxValue};`
    };
  }

  _resolveTrackMax(value, fallback = 5) {
    const numeric = Number(value);
    const base = Number.isFinite(numeric) ? numeric : fallback;
    return Math.min(Math.max(Math.floor(base), 1), 10);
  }

  _getPokemonTrackMaxConfig() {
    const settings = this.actor.system.sheetSettings?.trackMax ?? {};
    const attributes = Object.fromEntries(
      ATTRIBUTE_DEFINITIONS.map((attribute) => [
        attribute.key,
        this._resolveTrackMax(settings.attributes?.[attribute.key], 5)
      ])
    );
    const skills = Object.fromEntries(
      SKILL_DEFINITIONS.map((skill) => [
        skill.key,
        this._resolveTrackMax(settings.skills?.[skill.key], 5)
      ])
    );
    const extra = this._resolveTrackMax(settings.extra, 5);
    return { attributes, skills, extra };
  }

  _toTitleCaseKey(value) {
    if (!value || typeof value !== "string") return "Other";
    return `${value[0].toUpperCase()}${value.slice(1)}`;
  }

  _applyPokemonTabState(html, tabName) {
    const tab = this._normalizePokemonView(tabName);
    html.find("[data-action='switch-pokemon-tab']").removeClass("is-active");
    html.find(`.pokemon-view-button[data-tab='${tab}']`).addClass("is-active");
    html.find(".pokemon-view-panel").removeClass("is-active");
    html.find(`.pokemon-view-panel[data-tab='${tab}']`).addClass("is-active");
  }

  _normalizePokemonView(tabName) {
    if (tabName === "learned" || tabName === "settings") return tabName;
    return "main";
  }

  _buildPokemonMatchups() {
    const primary = this.actor.system.types?.primary;
    const secondary = this.actor.system.types?.secondary;
    const defenderTypes = [primary, secondary].filter((typeKey) => typeKey && typeKey !== "none");

    const matchups = {
      resistHalf: [],
      resistQuarter: [],
      weakDouble: [],
      weakQuad: [],
      immune: []
    };

    for (const attackType of TYPE_OPTIONS) {
      if (attackType === "none") continue;
      const table = TYPE_EFFECTIVENESS[attackType];
      if (!table) continue;

      let multiplier = 1;
      for (const defenderType of defenderTypes) {
        if (table.immune.includes(defenderType)) {
          multiplier = 0;
          break;
        }
        if (table.double.includes(defenderType)) multiplier *= 2;
        if (table.half.includes(defenderType)) multiplier *= 0.5;
      }

      const labelPath = MOVE_TYPE_LABEL_BY_KEY[attackType] ?? "POKROLE.Common.Unknown";
      if (multiplier === 0) matchups.immune.push(labelPath);
      else if (multiplier === 0.25) matchups.resistQuarter.push(labelPath);
      else if (multiplier === 0.5) matchups.resistHalf.push(labelPath);
      else if (multiplier === 2) matchups.weakDouble.push(labelPath);
      else if (multiplier === 4) matchups.weakQuad.push(labelPath);
    }

    return matchups;
  }
}
