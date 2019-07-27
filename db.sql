SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `uid` varchar(100) COLLATE utf8_unicode_ci NOT NULL COMMENT '用户id',
  `username` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT '用户昵称',
	`password` varchar(1000) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT '密码',
  `email` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT '邮箱',
  PRIMARY KEY (`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;


BEGIN;
INSERT INTO `user` VALUES ('21ma84sk2tkw00021ma84sk2tkw000', 'admin', 'admin', '11@qq.com');
INSERT INTO `user` VALUES ('3a9f12z1ey200003a9f12z1ey20000', 'xutongbao', 'xutongbao', '12@qq.com');
COMMIT;

DROP TABLE IF EXISTS `overtime`;
CREATE TABLE `overtime` (
  `applicationNumber` varchar(100) COLLATE utf8_unicode_ci NOT NULL COMMENT '申请单号',
	`nickname` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT '姓名',
  `type` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT '申请类型',
  `startTime` datetime DEFAULT NULL COMMENT '开始日期',
  `endTime` datetime DEFAULT NULL COMMENT '结束日期',
  PRIMARY KEY (`applicationNumber`) USING BTREE
) 


BEGIN;
INSERT INTO `overtime` VALUES ('80nt32no6jssg0', '徐同保', '1', '2019-05-23 00:00:00', '2019-05-24 00:00:00');
INSERT INTO `overtime` VALUES ('80nt32no6jddg022', '乐天', '2', '2019-05-23 00:00:00', '2019-05-25 12:00:00');
INSERT INTO `overtime` VALUES ('80nt32nsso6jg0', '志杰', '3', '2019-05-23 00:00:00', '2019-05-25 12:00:00');
COMMIT;

BEGIN;
INSERT INTO `overtime` VALUES ('80nt32no6jssg0333', '徐同保名', '1', '2019-05-23 00:00:00', '2019-05-24 00:00:00');
COMMIT;


delete from overtime where applicationNumber='80nt32no6jddg022'


BEGIN;
UPDATE overtime SET nickname = '新名字' WHERE applicationNumber = '12pnraanmsbk0';
COMMIT;


SELECT * FROM overtime WHERE nickname like '%名%';

DROP TABLE IF EXISTS `upload`;
CREATE TABLE `upload` (
  `uid` varchar(100) COLLATE utf8_unicode_ci NOT NULL COMMENT 'ID',
  `path` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT '路径',
	`originalname` varchar(1000) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT '原始文件名',
  `create_time` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT '创建时间',
  PRIMARY KEY (`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

DROP TABLE IF EXISTS `banner`;
CREATE TABLE `banner` (
  `uid` varchar(100) COLLATE utf8_unicode_ci NOT NULL COMMENT 'ID',
  `path` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT '路径',
	`remarks` varchar(1000) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT '备注',
  `create_time` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT '创建时间',
  PRIMARY KEY (`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

DROP TABLE IF EXISTS `article`;
CREATE TABLE `article` (
  `uid` varchar(100) COLLATE utf8_unicode_ci NOT NULL COMMENT 'ID',
  `title` varchar(100) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT '标题',
  `file_name` varchar(100) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT '文件名字',
  `path` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT '路径',
  `content` varchar(1000) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT '内容',
  `create_time` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT '创建时间',
  PRIMARY KEY (`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;


select count(*) from upload;

select * from upload order by create_time DESC
select * from upload order by create_time ASC
select * from upload  order by create_time ASC limit 0,10 

