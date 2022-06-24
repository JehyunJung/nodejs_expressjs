'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config.json')[env];
const db = {};

const User=require('./User');
const Author=require('./Author');
const Topic=require('./Topic');

console.log("config: "+ config.database);
const sequelize=new Sequelize(config.database,config.username,config.password,config);
console.log("sequelize: "+ sequelize);

db.sequelize=sequelize;
db.Sequelize=sequelize;

//모델 정보 추가
db.User=User;
db.Author=Author;
db.Topic=Topic;

//모델과 테이블 간 연결
User.init(sequelize);
Author.init(sequelize);
Topic.init(sequelize);

//연관관계 형성
Topic.associate(db);
Author.associate(db);

module.exports = db;
