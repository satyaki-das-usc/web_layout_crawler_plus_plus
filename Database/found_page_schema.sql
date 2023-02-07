CREATE DATABASE web_layout_crawler;
CREATE TABLE web_layout_crawler.found_page (
  `ID` int NOT NULL AUTO_INCREMENT,
  `URL` varchar(2000) DEFAULT NULL,
  `Domain` varchar(1000) DEFAULT NULL,
  `StackTraceJSON` JSON,
  `CapturedRequests` JSON,
  `ScannedOn` datetime DEFAULT CURRENT_TIMESTAMP,
  `ParentPage` varchar(2000) DEFAULT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
