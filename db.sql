SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `uid` varchar(100) COLLATE utf8_unicode_ci NOT NULL COMMENT '用户id',
  `password` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT '密码',
  `nickname` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT '用户昵称',
  PRIMARY KEY (`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;


BEGIN;
INSERT INTO `user` VALUES ('21ma84sk2tkw00021ma84sk2tkw000', 'admin', 'admin');
INSERT INTO `user` VALUES ('3a9f12z1ey200003a9f12z1ey20000', 'xutongbao', 'xutongbao');
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


SELECT * FROM overtime WHERE nickname like '%名%'


