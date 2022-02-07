"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionsService = void 0;
const locations_service_1 = require("./locations.service");
class TransactionsService {
    static adjustLocationQty(client, location_id, qty_metal, qty_plastic) {
        return __awaiter(this, void 0, void 0, function* () {
            const updateLocationSQL = 'UPDATE locations SET qty_metal = qty_metal + $1, qty_plastic = qty_plastic + $2 WHERE id = $3';
            yield client.query(updateLocationSQL, [
                qty_metal,
                qty_plastic,
                location_id,
            ]);
        });
    }
    static checkoutContainer(pgPool, qty, from_location_id) {
        return __awaiter(this, void 0, void 0, function* () {
            // Lookup from_location_id to make sure it's a valid affiliate
            const location = yield locations_service_1.LocationsService.locationbyId(pgPool, from_location_id);
            if (!location || location.type !== 'affiliate') {
                throw new Error(`${from_location_id} is not a valid affiliate location`);
            }
            // Don't allow ridiculous qtys
            if (qty < 1 || qty > 10) {
                throw new Error(`Can only check out from 1-10 containers at a time`);
            }
            // And don't allow them to check out more than the affiliate has - not sure if this is OK
            // TODO: Don't assume it's plastic
            if (qty > location.qty_plastic) {
                throw new Error('You cannot get more dishes than the affiliate has on hand');
            }
            // TODO: Get member location id from authentication
            const to_location_id = 5;
            const client = yield pgPool.connect();
            try {
                yield client.query('BEGIN');
                // TODO: Don't assume it's plastic.  Get from affiliate record, maybe
                const insertTransactionSQL = 'INSERT INTO transactions(type, from_location_id, to_location_id, qty_plastic) VALUES ($1,$2,$3,$4)';
                yield client.query(insertTransactionSQL, [
                    'affiliate_to_user',
                    from_location_id,
                    to_location_id,
                    qty,
                ]);
                // Adjust inventory totals on each side
                yield this.adjustLocationQty(client, from_location_id, 0, -qty);
                yield this.adjustLocationQty(client, to_location_id, 0, qty);
                // And finish
                yield client.query('COMMIT');
            }
            catch (e) {
                yield client.query('ROLLBACK');
                throw e;
            }
            finally {
                client.release();
            }
        });
    }
    static returnContainer(pgPool, qty_metal, qty_plastic, to_location_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const location = yield locations_service_1.LocationsService.locationbyId(pgPool, to_location_id);
            if (!location || location.type !== 'dropoff-point') {
                throw new Error(`${to_location_id} is not a valid dropoff location`);
            }
            // Don't allow ridiculous qtys
            if (qty_metal < 0 ||
                qty_metal > 50 ||
                qty_plastic < 0 ||
                qty_plastic > 50 ||
                qty_plastic + qty_metal < 1) {
                throw new Error(`Can only dropoff from 1-50 containers at a time`);
            }
            // And don't allow them to return more than they have
            const member = yield locations_service_1.LocationsService.locationbyId(pgPool, to_location_id);
            if (qty_metal > member.qty_metal || qty_plastic > member.qty_plastic) {
                throw new Error('You cannot return more dishes than you have');
            }
            // TODO: Get member location id from authentication
            const from_location_id = 5;
            const client = yield pgPool.connect();
            try {
                yield client.query('BEGIN');
                const insertTransactionSQL = 'INSERT INTO transactions(type, from_location_id, to_location_id, qty_metal, qty_plastic) VALUES ($1,$2,$3,$4,$5)';
                yield client.query(insertTransactionSQL, [
                    'user_to_dropoff',
                    from_location_id,
                    to_location_id,
                    qty_metal,
                    qty_plastic,
                ]);
                // Adjust inventory totals on each side
                yield this.adjustLocationQty(client, from_location_id, -qty_metal, -qty_plastic);
                yield this.adjustLocationQty(client, to_location_id, qty_metal, qty_plastic);
                // And finish
                yield client.query('COMMIT');
            }
            catch (e) {
                yield client.query('ROLLBACK');
                throw e;
            }
            finally {
                client.release();
            }
        });
    }
}
exports.TransactionsService = TransactionsService;
