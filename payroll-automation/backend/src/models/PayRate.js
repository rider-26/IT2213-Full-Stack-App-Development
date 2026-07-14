// UC-003: a part-timer's pay terms. The engine picks the newest rate whose
// effective_from is on or before the pay period's start date, so historic
// periods keep calculating with the rate that applied back then.

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const PayRate = sequelize.define(
  'PayRate',
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    staffId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'staff', key: 'id' },
    },
    // Integer cents, not NUMERIC dollars — the HLD drafted NUMERIC but the
    // money rule (no floats/inexact types for currency) wins. Flagged to team.
    hourlyRateCents: { type: DataTypes.INTEGER, allowNull: false },
    otMultiplier: { type: DataTypes.DECIMAL(4, 2), allowNull: false, defaultValue: 1.5 },
    phMultiplier: { type: DataTypes.DECIMAL(4, 2), allowNull: false, defaultValue: 2.0 },
    effectiveFrom: { type: DataTypes.DATEONLY, allowNull: false },
  },
  { tableName: 'pay_rate' }
);

module.exports = PayRate;
