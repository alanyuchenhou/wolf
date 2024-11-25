CREATE TABLE IF NOT EXISTS "PhoneNumber" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "e164" text NOT NULL,
  "agentId" uuid
);
ALTER TABLE "PhoneNumber" ALTER COLUMN "e164" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "PhoneNumber" ALTER COLUMN "agentId" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "PhoneNumber" ADD COLUMN "updatedAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "PhoneNumber" ADD COLUMN "createdAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "PhoneNumber" ADD COLUMN "userId" uuid NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "PhoneNumber" ADD CONSTRAINT "PhoneNumber_agentId_Agent_id_fk" FOREIGN KEY ("agentId") REFERENCES "public"."Agent"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "PhoneNumber" ADD CONSTRAINT "PhoneNumber_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
