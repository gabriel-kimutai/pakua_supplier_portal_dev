import { API_URL } from "@/utils/env";
import { useAppSession } from "@/utils/session";
import { createServerFn } from "@tanstack/react-start";


export interface UploadListing {
  name: string
  category?: string
  subcategory?: string
  quantity: number | string
  country?: string
  brand?: string
  price: number | string
  supplier?: string
  location?: string
  attributes?: Record<string, any>
  [key: string]: any
}

export interface Listing {
  id: number;
  user_id: number;
  title: string;
  description: string;
  price: number;
  quantity: number;
  category_id: number;
  category: {
    id: number;
    name: string;
    slug: string;
    created_at: string | null;
    updated_at: string | null;
  };
  country_id: number;
  supplier_id: number;
  brand_id: number;
  attributes: {
    width: number;
    length: number;
    material: string;
    thickness: number;
    price_measure: string;
  };
  location: string;
  images: string[]; // assuming images are URLs as strings; change type if it's a different structure
  seller: {
    id: number;
    first_name: string;
    last_name: string;
    username: string;
    phone_number: string;
    email: string;
  };
  created_at: string;
  updated_at: string;
}


export const getListings = createServerFn()
  .handler(async () => {
    try {
      const { data: { token } } = await useAppSession()
      const res = await fetch(`${API_URL}/account/listings`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (!res.ok) {
        throw new Error(await res.text())
      }

      return await res.json()
    } catch (e) {
      console.error("failed to load listings", e)
    }
  })


export const getListing = createServerFn()
  .validator((d: string) => d)
  .handler(async ({ data }) => {
    try {
      const { data: { token } } = await useAppSession()
      const res = await fetch(`${API_URL}/listings/${data}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (!res.ok) throw new Error(await res.text())

      const listing = await res.json() as Listing

      return listing
    } catch (e) {
      throw new Error(`${e}`)
    }
  })


export const uploadListings = createServerFn({ method: 'POST' })
  .validator((d: UploadListing[]) => d)
  .handler(async ({ data }) => {
    try {
      const { data: { token } } = await useAppSession()
      const res = await fetch(`${API_URL}/listings/bulk`, {
        method: 'POST',
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      })

      if (!res.ok) {
        return {
          error: true,
          message: await res.text()
        }
      }

      return

    } catch (e) {
      console.error("failed to upload listings", e)
    }
  })

export const updateListing = createServerFn({ method: 'POST' })
  .validator((form: FormData) => form)
  .handler(async ({ data }) => {
    try {


      const { data: { token } } = await useAppSession();
      const id = data.get("id")
      const response = await fetch(`${API_URL}/listings/${id}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: data,
      });
      if (!response.ok) {
        const errorText = await response.text();
        return {
          error: true,
          message: errorText
        }
        // throw new Error(`Failed to update listing: ${errorText}`);
      }
      return

    } catch (e) {
      console.error("failed to update listings", e)
    }
  })
