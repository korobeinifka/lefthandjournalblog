export type PublishingStatus = "draft" | "published" | "scheduled";

export type PublishingPost = {
  id: string;
  slug?: string;
  title: string;
  description: string;
  category: string;
  pubDate: string;
  heroImage?: string;
  heroImageAlt?: string;
  status: PublishingStatus;
  body: string;
};
