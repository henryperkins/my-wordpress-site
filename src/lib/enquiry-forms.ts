import type { FormDefinition, FormField } from "@emdash-cms/plugin-forms";

export const ENQUIRY_FORM_IDS = {
	project: "lakefront-project-enquiry",
	consultation: "lakefront-website-consultation",
} as const;

export const ENQUIRY_PLUGIN_ID = "emdash-forms";

export const ENQUIRY_SUBMISSION_INDEXES: Array<string | string[]> = [
	"formId", "status", "starred", "createdAt", ["formId", "createdAt"], ["formId", "status"],
];

const field = (name: string, label: string, type: FormField["type"] = "text", required = false): FormField => ({
	id: name, name, label, type, required, width: "full",
});

/** Initial inbox schemas only. Public form copy and choices still come from CMS page blocks. */
export function initialEnquiryForms(now = new Date().toISOString()): Array<{ id: string; form: FormDefinition }> {
	const common = [field("name", "Your name", "text", true), field("email", "Work email", "email", true)];
	const metadata = [field("subject", "Subject", "hidden"), field("page", "Page", "hidden"), field("email_notification", "Email notification", "hidden")];
	return [
		{ id: ENQUIRY_FORM_IDS.project, name: "Project enquiries", fields: [...common, field("website", "Current website"), field("timeline", "Timeline"), field("needs", "Needs", "checkbox-group"), field("platform", "Platform"), field("notes", "Project notes", "textarea"), ...metadata] },
		{ id: ENQUIRY_FORM_IDS.consultation, name: "Website Consultation", fields: [...common, field("phone", "Phone"), field("notes", "Consultation notes", "textarea"), ...metadata] },
	].map(({ id, name, fields }) => ({
		id,
		form: {
			name, slug: id, pages: [{ fields }], status: "active", submissionCount: 0, lastSubmissionAt: null, createdAt: now, updatedAt: now,
			settings: {
				confirmationMessage: "Thank you for your enquiry.", submitLabel: "Send request", spamProtection: "honeypot",
				notifyEmails: [], digestEnabled: false, digestHour: 9, retentionDays: 0,
			},
		},
	}));
}
