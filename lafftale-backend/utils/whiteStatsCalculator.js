// White Stats Calculator basierend auf SRO CMS InventoryService.php
// Diese Funktion berechnet die tatsächlichen White-Stats aus den Datenbank-Werten

const { calculateBlueStats } = require('./blueStatsCalculator');

function calculateWhiteStats(item) {
  const OptLevel = item.OptLevel || 0;
  const Variance = item.Variance || 0;

  // Percentage calculator function from PHP CMS
  const percentage = (variance, index) => {
    return Math.floor(((variance / Math.pow(32, index)) & 0x1f) * 3.23);
  };

  const stats = {};

  // Physical Attack (Weapons)
  if (item.PAttackMin_L > 0 && item.PAttackMax_L > 0) {
    const minAttack = Math.round(
      item.PAttackMin_L +
        (item.PAttackInc || 0) * OptLevel +
        ((item.PAttackMin_U - item.PAttackMin_L) * percentage(Variance, 4)) / 100
    );
    const maxAttack = Math.round(
      item.PAttackMax_L +
        (item.PAttackInc || 0) * OptLevel +
        ((item.PAttackMax_U - item.PAttackMax_L) * percentage(Variance, 4)) / 100
    );
    stats.PhysicalAttack = {
      min: minAttack,
      max: maxAttack,
      percentage: percentage(Variance, 4),
      display: `Phy. atk. pwr. ${minAttack} ~ ${maxAttack} (+${percentage(Variance, 4)}%)`,
    };
  }

  // Magical Attack (Weapons)
  if (item.MAttackMin_L > 0 && item.MAttackMax_L > 0) {
    const minAttack = Math.round(
      item.MAttackMin_L +
        (item.MAttackInc || 0) * OptLevel +
        ((item.MAttackMin_U - item.MAttackMin_L) * percentage(Variance, 5)) / 100
    );
    const maxAttack = Math.round(
      item.MAttackMax_L +
        (item.MAttackInc || 0) * OptLevel +
        ((item.MAttackMax_U - item.MAttackMax_L) * percentage(Variance, 5)) / 100
    );
    stats.MagicalAttack = {
      min: minAttack,
      max: maxAttack,
      percentage: percentage(Variance, 5),
      display: `Mag. atk. pwr. ${minAttack} ~ ${maxAttack} (+${percentage(Variance, 5)}%)`,
    };
  }

  // Physical Defense (Protectors)
  if (item.PhysicalDefense_L > 0) {
    const defense = Math.round(
      item.PhysicalDefense_L +
        (item.PhysicalDefense_Inc || 0) * OptLevel +
        ((item.PhysicalDefense_U - item.PhysicalDefense_L) * percentage(Variance, 3)) / 100,
      1
    );
    stats.PhysicalDefense = {
      value: defense,
      percentage: percentage(Variance, 3),
      display: `Phy. def. pwr. ${defense.toFixed(1)} (+${percentage(Variance, 3)}%)`,
    };
  }

  // Magical Defense (Protectors)
  if (item.MagicalDefense_L > 0) {
    const defense = Math.round(
      item.MagicalDefense_L +
        (item.MagicalDefense_Inc || 0) * OptLevel +
        ((item.MagicalDefense_U - item.MagicalDefense_L) * percentage(Variance, 4)) / 100,
      1
    );
    stats.MagicalDefense = {
      value: defense,
      percentage: percentage(Variance, 4),
      display: `Mag. def. pwr. ${defense.toFixed(1)} (+${percentage(Variance, 4)}%)`,
    };
  }

  // Hit Rate (Weapons)
  if (item.HitRate_L > 0) {
    const hitRate = Math.round(
      item.HitRate_L +
        (item.HitRate_Inc || 0) * OptLevel +
        ((item.HitRate_U - item.HitRate_L) * percentage(Variance, 3)) / 100
    );
    stats.HitRate = {
      value: hitRate,
      percentage: percentage(Variance, 3),
      display: `Attack rate ${hitRate} (+${percentage(Variance, 3)}%)`,
    };
  }

  // Critical Hit Rate (Weapons)
  if (item.CriticalHitRate_L > 0) {
    const critical = Math.round(
      item.CriticalHitRate_L +
        ((item.CriticalHitRate_U - item.CriticalHitRate_L) * percentage(Variance, 6)) / 100
    );
    stats.CriticalHitRate = {
      value: critical,
      percentage: percentage(Variance, 6),
      display: `Critical ${critical} (+${percentage(Variance, 6)}%)`,
    };
  }

  // Evasion Rate (Parry Rate)
  if (item.EvasionRate_L > 0) {
    const evasion = Math.round(
      item.EvasionRate_L +
        (item.EvasionRate_Inc || 0) * OptLevel +
        ((item.EvasionRate_U - item.EvasionRate_L) * percentage(Variance, 5)) / 100
    );
    stats.EvasionRate = {
      value: evasion,
      percentage: percentage(Variance, 5),
      display: `Parry rate ${evasion} (+${percentage(Variance, 5)}%)`,
    };
  }

  // Block Rate (Shields)
  if (item.BlockRate_L > 0) {
    const blockRate = Math.round(
      item.BlockRate_L + ((item.BlockRate_U - item.BlockRate_L) * percentage(Variance, 3)) / 100
    );
    stats.BlockRate = {
      value: blockRate,
      percentage: percentage(Variance, 3),
      display: `Block Rate ${blockRate} (+${percentage(Variance, 3)}%)`,
    };
  }

  // Attack Range
  if (item.AttackRange > 0) {
    stats.AttackRange = {
      value: item.AttackRange / 10,
      display: `Attack distance ${(item.AttackRange / 10).toFixed(1)} m`,
    };
  }

  // Durability
  if (item.Durability_U > 0) {
    stats.Durability = {
      current: item.Data || 0,
      max: item.Durability_U,
      percentage: percentage(Variance, 0),
      display: `Durability ${item.Data || 0}/${item.Durability_U} (+${percentage(Variance, 0)}%)`,
    };
  }

  // Physical Absorption (Accessories)
  if (item.PhysicalAbsorption_L > 0) {
    const absorption =
      Math.round(
        item.PhysicalAbsorption_L +
          (item.PhysicalAbsorption_Inc || 0) * OptLevel +
          ((item.PhysicalAbsorption_U - item.PhysicalAbsorption_L) * percentage(Variance, 0)) / 100
      ) / 10; // Divided by 10 like in SRO CMS
    stats.PhysicalAbsorption = {
      value: absorption,
      percentage: percentage(Variance, 0),
      display: `Phy. absorption ${absorption.toFixed(1)} (+${percentage(Variance, 0)}%)`,
    };
  }

  // Magical Absorption (Accessories)
  if (item.MagicalAbsorption_L > 0) {
    const absorption =
      Math.round(
        item.MagicalAbsorption_L +
          (item.MagicalAbsorption_Inc || 0) * OptLevel +
          ((item.MagicalAbsorption_U - item.MagicalAbsorption_L) * percentage(Variance, 1)) / 100
      ) / 10; // Divided by 10 like in SRO CMS
    stats.MagicalAbsorption = {
      value: absorption,
      percentage: percentage(Variance, 1),
      display: `Mag. absorption ${absorption.toFixed(1)} (+${percentage(Variance, 1)}%)`,
    };
  }

  // Physical Reinforce (Accessories/Protectors)
  if (item.PhysicalReinforce_L > 0) {
    const reinforce =
      (item.PhysicalReinforce_L +
        ((item.PhysicalReinforce_U - item.PhysicalReinforce_L) * percentage(Variance, 1)) / 100) /
      10;
    stats.PhysicalReinforce = {
      value: reinforce,
      percentage: percentage(Variance, 1),
      display: `Phy. reinforce ${reinforce.toFixed(1)} (+${percentage(Variance, 1)}%)`,
    };
  }

  // Magical Reinforce (Accessories/Protectors)
  if (item.MagicalReinforce_L > 0) {
    const reinforce =
      (item.MagicalReinforce_L +
        ((item.MagicalReinforce_U - item.MagicalReinforce_L) * percentage(Variance, 2)) / 100) /
      10;
    stats.MagicalReinforce = {
      value: reinforce,
      percentage: percentage(Variance, 2),
      display: `Mag. reinforce ${reinforce.toFixed(1)} (+${percentage(Variance, 2)}%)`,
    };
  }

  return stats;
}

function calculateAllStats(item) {
  return {
    whiteStats: calculateWhiteStats(item),
    blueStats: calculateBlueStats(item),
  };
}

module.exports = { calculateWhiteStats, calculateAllStats };
