"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.transactions = exports.locations = exports.helloWorld = void 0;
const pg_1 = require("pg");
const dotenv = __importStar(require("dotenv"));
const locations_service_1 = require("./services/locations.service");
const transactions_service_1 = require("./services/transactions.service");
dotenv.config();
const helloWorld = (req, res) => {
    res.json('Hello, World from TypeScript');
};
exports.helloWorld = helloWorld;
const createUnixSocketPool = (config) => __awaiter(void 0, void 0, void 0, function* () {
    const dbSocketPath = process.env.DB_SOCKET_PATH || '/cloudsql';
    // Establish a connection to the database
    return new pg_1.Pool(Object.assign({ user: process.env.DB_USER, password: process.env.DB_PASS, database: process.env.DB_NAME, host: process.env.NODE_ENV === 'production'
            ? `${dbSocketPath}/${process.env.INSTANCE_CONNECTION_NAME}`
            : process.env.DB_HOST }, config));
});
let pgPool;
const locations = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // This is not cool, but
        const params = req.path.split('/');
        const type = params[params.length - 1];
        console.log(`Looking for type ${type}`);
        console.log('Checking for Postgres pool');
        if (!pgPool) {
            console.log('Starting up Postgres Pool');
            pgPool = yield createUnixSocketPool({});
            console.log('Postgres Pool Started');
        }
        console.log('Running query');
        const locations = yield locations_service_1.LocationsService.locationsWithType(pgPool, type);
        console.log('Query ended');
        res.json(locations);
    }
    catch (err) {
        const wrappedError = new Error(err);
        console.error(`${err.stack}\n${wrappedError.stack}`);
        res.status(500).json({ error: 'An error occurred looking up locations' });
    }
});
exports.locations = locations;
const transactions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (req.method !== 'POST') {
            throw new Error('Must post transaction here');
        }
        const params = req.path.split('/');
        const type = params[params.length - 1];
        console.log(`Transcation type ${type}`);
        console.log('Checking for Postgres pool');
        if (!pgPool) {
            console.log('Starting up Postgres Pool');
            pgPool = yield createUnixSocketPool({});
            console.log('Postgres Pool Started');
        }
        console.log('Running trx');
        switch (type) {
            case 'checkout-container':
                yield transactions_service_1.TransactionsService.checkoutContainer(pgPool, req.body.qty, req.body.from_location_id);
                break;
            case 'return-container':
                yield transactions_service_1.TransactionsService.returnContainer(pgPool, req.body.qty_metal, req.body.qty_plastic, req.body.to_location_id);
                break;
            default:
                break;
        }
        console.log('Trx ended');
        res.json(exports.locations);
    }
    catch (err) {
        const wrappedError = new Error(err);
        console.error(`${err.stack}\n${wrappedError.stack}`);
        res.status(500).json({ error: 'An error occurred in that transaction' });
    }
});
exports.transactions = transactions;
