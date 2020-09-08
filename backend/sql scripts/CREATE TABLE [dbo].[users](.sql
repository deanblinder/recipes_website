-- CREATE TABLE [dbo].[users](
-- 	[user_id] [UNIQUEIDENTIFIER] PRIMARY KEY NOT NULL default NEWID(),
-- 	[username] [varchar](30) NOT NULL UNIQUE,
-- 	[password] [varchar](300) NOT NULL
-- )
CREATE TABLE users(
	[user_id] [int] IDENTITY NOT NULL ,
	[username] [varchar](30) NOT NULL UNIQUE,
	[password] [varchar](300) NOT NULL,
	[first_name] [varchar](300) NOT NULL,
	[last_name] [varchar](300) NOT NULL,
	[country] [varchar](300) NOT NULL,
	[confirmation_password] [varchar](300) NOT NULL,
	[email] [varchar](300) NOT NULL
	[profile_pic] [varchar](300) NOT NULL
)
