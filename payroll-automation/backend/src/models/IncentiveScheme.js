// UC-003: how full-timer incentive pay is worked out. The rules live in
// rule_definition (JSONB) so the scheme can change without a code change:
//
// {
//   "requiredMetrics": ["sessions"],          // missing one of these => line incomplete
//   "metrics": {
//     "sessions":   { "type": "per_unit",   "rateCents": 1500 },
//     "enrolments": { "type": "per_unit",   "rateCents": 2500 },
//     "sales":      { "type": "percentage", "basisPoints": 200 },   // 2% of sales (sales metricValue is in cents)
//     "kpi":        { "type": "tiered", "tiers": [ { "min": 80, "bonusCents": 50000 } ] }
//   }
// }
//
// incentiveEngine.js is the only interpreter of this shape.

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const IncentiveScheme = sequelize.define(
  'IncentiveScheme',
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    ruleDefinition: { type: DataTypes.JSONB, allowNull: false },
    active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  },
  { tableName: 'incentive_scheme' }
);

module.exports = IncentiveScheme;
