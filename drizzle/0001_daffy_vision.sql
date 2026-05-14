CREATE TABLE `chatHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`pdfFileName` varchar(255),
	`pdfContent` text,
	`messages` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `chatHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pdfConversions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`toolType` varchar(50) NOT NULL,
	`inputFileName` varchar(255),
	`outputFileName` varchar(255),
	`inputSize` int,
	`outputSize` int,
	`status` varchar(20) DEFAULT 'completed',
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `pdfConversions_id` PRIMARY KEY(`id`)
);
