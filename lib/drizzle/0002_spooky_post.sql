ALTER TABLE "PhoneNumber" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "PhoneNumber" ADD COLUMN "e164" varchar(32) NOT NULL;