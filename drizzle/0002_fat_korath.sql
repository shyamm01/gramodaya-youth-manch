ALTER TABLE "gram_panchayats" DROP CONSTRAINT "gram_panchayats_district_id_districts_id_fk";
--> statement-breakpoint
DROP INDEX "idx_gram_panchayats_district_id";--> statement-breakpoint
DROP INDEX "idx_villages_district_id";--> statement-breakpoint
ALTER TABLE "gram_panchayats" ALTER COLUMN "district_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "gram_panchayats" ALTER COLUMN "name_hindi" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "gram_panchayats" ADD COLUMN "district_name" text DEFAULT 'Jaunpur' NOT NULL;--> statement-breakpoint
ALTER TABLE "gram_panchayats" ADD COLUMN "district_name_hindi" text DEFAULT 'जौनपुर';--> statement-breakpoint
ALTER TABLE "gram_panchayats" ADD COLUMN "state_id" bigint;--> statement-breakpoint
ALTER TABLE "gram_panchayats" ADD COLUMN "state_name" text DEFAULT 'Uttar Pradesh' NOT NULL;--> statement-breakpoint
ALTER TABLE "gram_panchayats" ADD COLUMN "state_name_hindi" text DEFAULT 'उत्तर प्रदेश';--> statement-breakpoint
ALTER TABLE "gram_panchayats" ADD COLUMN "block_name" text DEFAULT 'Shahganj';--> statement-breakpoint
ALTER TABLE "gram_panchayats" ADD COLUMN "block_name_hindi" text DEFAULT 'शाहगंज';--> statement-breakpoint
ALTER TABLE "gram_panchayats" ADD COLUMN "pincode" text DEFAULT '222139';--> statement-breakpoint
ALTER TABLE "gram_panchayats" ADD COLUMN "post_office" text DEFAULT 'Rasulpur';--> statement-breakpoint
ALTER TABLE "gram_panchayats" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "gram_panchayats" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN "pincode" text DEFAULT '222139';--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN "state" text DEFAULT 'Uttar Pradesh';--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN "district" text DEFAULT 'Jaunpur';--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN "block" text DEFAULT 'Shahganj';--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN "gram_panchayat" text DEFAULT 'Bahera';--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN "village_name" text DEFAULT 'Rasoolpur';--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN "post_office" text DEFAULT 'Rasulpur';--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN "house_no" text;--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN "street" text;--> statement-breakpoint
ALTER TABLE "villages" ADD COLUMN "gram_panchayat_name" text DEFAULT 'Bahera';--> statement-breakpoint
ALTER TABLE "villages" ADD COLUMN "gram_panchayat_name_hindi" text DEFAULT 'बहेरा';--> statement-breakpoint
ALTER TABLE "villages" ADD COLUMN "district_name" text DEFAULT 'Jaunpur';--> statement-breakpoint
ALTER TABLE "villages" ADD COLUMN "district_name_hindi" text DEFAULT 'जौनपुर';--> statement-breakpoint
ALTER TABLE "villages" ADD COLUMN "state_name" text DEFAULT 'Uttar Pradesh';--> statement-breakpoint
ALTER TABLE "villages" ADD COLUMN "state_name_hindi" text DEFAULT 'उत्तर प्रदेश';--> statement-breakpoint
ALTER TABLE "villages" ADD COLUMN "block_name" text DEFAULT 'Shahganj';--> statement-breakpoint
ALTER TABLE "villages" ADD COLUMN "block_name_hindi" text DEFAULT 'शाहगंज';--> statement-breakpoint
ALTER TABLE "villages" ADD COLUMN "pincode" text DEFAULT '222139';--> statement-breakpoint
ALTER TABLE "villages" ADD COLUMN "post_office" text DEFAULT 'Rasulpur';--> statement-breakpoint
ALTER TABLE "gram_panchayats" ADD CONSTRAINT "gram_panchayats_state_id_states_id_fk" FOREIGN KEY ("state_id") REFERENCES "public"."states"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gram_panchayats" ADD CONSTRAINT "gram_panchayats_district_id_districts_id_fk" FOREIGN KEY ("district_id") REFERENCES "public"."districts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_gram_panchayats_district" ON "gram_panchayats" USING btree ("district_name");--> statement-breakpoint
CREATE INDEX "idx_gram_panchayats_pincode" ON "gram_panchayats" USING btree ("pincode");--> statement-breakpoint
CREATE INDEX "idx_villages_district_name" ON "villages" USING btree ("district_name");--> statement-breakpoint
CREATE INDEX "idx_villages_pincode" ON "villages" USING btree ("pincode");