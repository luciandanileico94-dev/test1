export type Priority = 0 | 1; // 0 nice-to-have, 1 must-have

export type Event = {
  id: string;
  owner_id: string;
  slug: string;
  title: string;
  description: string | null;
  event_date: string | null;
  location_name: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  directions: string | null;
  cover_image_url: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
};

export type WishlistItem = {
  id: string;
  event_id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  product_url: string | null;
  price: number | null;
  priority: Priority;
  position: number;
  created_at: string;
};

export type Claim = {
  id: string;
  item_id: string;
  guest_name: string;
  guest_message: string | null;
  guest_token: string;
  claimed_at: string;
};

export type PublicClaim = Omit<Claim, "guest_token">;
