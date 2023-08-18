import { uint256ToBN } from "starknet/dist/utils/uint256";
import { callContract } from "./call";
import express from "express";
import cors from 'cors'
import mysql from 'mysql';

const { host, port, user, password, database } = require('./dbConfig');


const config = {
    connectionLimit: 10000,
    host: host,
    port : port,
    user: user ,
    password: password,
    database: database
}

let pool = mysql.createPool(config);

setTimeout( async  function () {
    await  pool.end()
    pool = await mysql.createPool(config);
} , 150000);


export const name = "ERC-721";
const { Contract }= require('./config');

export const getData = async (
  starknetWalletAddress: string,
  starknetNetwork: "mainnet" | "goerli",
): Promise<boolean> => {

  const errorCode:any = 0 ;
  if (
    !starknetWalletAddress.startsWith("0x") ||
    !/^(0x)?[0-9a-fA-F]/.test(starknetWalletAddress) || 
    starknetWalletAddress.length < 5 
  ) {
    return errorCode ;
  }

  const result = await callContract({
    starknetNetwork,
    contractAddress: Contract,
    entrypoint: "balanceOf",
    calldata: [starknetWalletAddress],
  });
  const balance = uint256ToBN({ low: result[0], high: result[1] });
  if (balance >= 1) {
    return balance;
  }
  return balance;
};

const app = express();

app.use(cors());



app.get('/query/:wallet', async(req, res) => {
   const wallet = req.params.wallet 
   const response  = await getData(wallet,"mainnet")
    res.send({count:Number(response)})
    console.log(`Log - Request from IP: ${req.ip} :Route: /query`);
});

app.get('/stake/:wallet', async(req, res) => {
  const wallet = req.params.wallet 
  const response  = await getData(wallet,"mainnet")

  if(Number(response)>0){

    pool.getConnection(function(err, connection) {
      if (err) throw err;
      const query = "SELECT * FROM `accounts` WHERE wallet='"+wallet+"'";
      connection.query(query, (error, results, fields) => {
          if (error) {
              return;
          }
          if(results.length==0){
            pool.getConnection(function(err, connection) {
              if (err) throw err;
              const query = "INSERT INTO `accounts`(`wallet`, `count`, `status`, `point`) VALUES ('"+wallet+"',"+Number(response)+",true,0)";
              connection.query(query, (error, results, fields) => {
                  if (error) {
                      return;
                  }
                  res.send({success:true});
                  connection.release();
                  if (err) throw err;
              });
          });
          }else{
            res.send({success:false});
            connection.release();
          }
          if (err) throw err;
      });
  });
  }else{
    res.send({success:false})

  }
   console.log(`Log - Request from IP: ${req.ip} :Route: /query`);
});



app.get('/control/:wallet', async(req, res) => {
  const wallet = req.params.wallet 
  const response  = await getData(wallet,"mainnet")

  if(Number(response)>0){
    pool.getConnection(function(err, connection) {
      if (err) throw err;
      const query = "SELECT * FROM `accounts` WHERE wallet='"+wallet+"'";
      connection.query(query, (error, results, fields) => {
          if (error) {
              return;
          }
          if(results.length>0){
            res.send({stake:true,data:results , count : Number(response)});
            connection.release();
          }else{
            res.send({stake:false,data:[] , count : Number(response)});
            connection.release();
          }
          if (err) throw err;
      });
  });
  }else{
    res.send({stake:false,data : [] , count : Number(response)})
  }
   console.log(`Log - Request from IP: ${req.ip} :Route: /query`);
});

const port_ = 4848;

app.listen(port_, () => {
    console.log(`REST API running on port :: ${port_}`);
});




