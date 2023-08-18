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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getData = exports.name = void 0;
var uint256_1 = require("starknet/dist/utils/uint256");
var call_1 = require("./call");
var express = require("express");
var cors = require("cors");
var mysql = require("mysql");
var _a = require('./dbConfig'), host = _a.host, port = _a.port, user = _a.user, password = _a.password, database = _a.database;
var config = {
    connectionLimit: 10000,
    host: host,
    port: port,
    user: user,
    password: password,
    database: database
};
var pool = mysql.createPool(config);
setTimeout(function () {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, pool.end()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, mysql.createPool(config)];
                case 2:
                    pool = _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}, 150000);
exports.name = "ERC-721";
var Contract = require('./config').Contract;
var getData = function (starknetWalletAddress, starknetNetwork) { return __awaiter(void 0, void 0, void 0, function () {
    var errorCode, result, balance;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                errorCode = 0;
                if (!starknetWalletAddress.startsWith("0x") || // Başında "0x" ile başlamalı
                    !/^(0x)?[0-9a-fA-F]/.test(starknetWalletAddress) ||
                    starknetWalletAddress.length < 5) {
                    return [2 /*return*/, errorCode];
                }
                return [4 /*yield*/, (0, call_1.callContract)({
                        starknetNetwork: starknetNetwork,
                        contractAddress: Contract,
                        entrypoint: "balanceOf",
                        calldata: [starknetWalletAddress],
                    })];
            case 1:
                result = _a.sent();
                balance = (0, uint256_1.uint256ToBN)({ low: result[0], high: result[1] });
                if (balance >= 1) {
                    return [2 /*return*/, balance];
                }
                return [2 /*return*/, balance];
        }
    });
}); };
exports.getData = getData;
var app = express();
app.use(cors());
app.get('/query/:wallet', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var wallet, response;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                wallet = req.params.wallet;
                return [4 /*yield*/, (0, exports.getData)(wallet, "mainnet")];
            case 1:
                response = _a.sent();
                res.send({ count: Number(response) });
                console.log("Log - Request from IP: ".concat(req.ip, " :Route: /query"));
                return [2 /*return*/];
        }
    });
}); });
app.get('/stake/:wallet', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var wallet, response;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                wallet = req.params.wallet;
                return [4 /*yield*/, (0, exports.getData)(wallet, "mainnet")];
            case 1:
                response = _a.sent();
                if (Number(response) > 0) {
                    pool.getConnection(function (err, connection) {
                        if (err)
                            throw err;
                        var query = "SELECT * FROM `accounts` WHERE wallet='" + wallet + "'";
                        connection.query(query, function (error, results, fields) {
                            if (error) {
                                return;
                            }
                            if (results.length == 0) {
                                pool.getConnection(function (err, connection) {
                                    if (err)
                                        throw err;
                                    var query = "INSERT INTO `accounts`(`wallet`, `count`, `status`, `point`) VALUES ('" + wallet + "'," + Number(response) + ",true,0)";
                                    connection.query(query, function (error, results, fields) {
                                        if (error) {
                                            return;
                                        }
                                        res.send({ success: true });
                                        connection.release();
                                        if (err)
                                            throw err;
                                    });
                                });
                            }
                            else {
                                res.send({ success: false });
                                connection.release();
                            }
                            if (err)
                                throw err;
                        });
                    });
                }
                else {
                    res.send({ success: false });
                }
                console.log("Log - Request from IP: ".concat(req.ip, " :Route: /query"));
                return [2 /*return*/];
        }
    });
}); });
app.get('/control/:wallet', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var wallet, response;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                wallet = req.params.wallet;
                return [4 /*yield*/, (0, exports.getData)(wallet, "mainnet")];
            case 1:
                response = _a.sent();
                if (Number(response) > 0) {
                    pool.getConnection(function (err, connection) {
                        if (err)
                            throw err;
                        var query = "SELECT * FROM `accounts` WHERE wallet='" + wallet + "'";
                        connection.query(query, function (error, results, fields) {
                            if (error) {
                                return;
                            }
                            if (results.length > 0) {
                                res.send({ stake: true, data: results, count: Number(response) });
                                connection.release();
                            }
                            else {
                                res.send({ stake: false, data: [], count: Number(response) });
                                connection.release();
                            }
                            if (err)
                                throw err;
                        });
                    });
                }
                else {
                    res.send({ stake: false, data: [], count: Number(response) });
                }
                console.log("Log - Request from IP: ".concat(req.ip, " :Route: /query"));
                return [2 /*return*/];
        }
    });
}); });
var port_ = 4848;
app.listen(port_, function () {
    console.log("REST API running on port :: ".concat(port_));
});
