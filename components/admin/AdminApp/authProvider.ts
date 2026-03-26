import { AuthProvider } from "react-admin";
import { createClient } from "@/lib/supabase/client";
import { api } from "@/services/apiClient";
import { UserProfile } from "@/types";

const supabase = createClient();

export const authProvider: AuthProvider = {
    // Called when the user attempts to log in
    login: async ({ username, password }: { username: string; password: string }) => {
        const { error } = await supabase.auth.signInWithPassword({
            email: username,
            password,
        });
        if (error) {
            throw new Error(error.message);
        }
    },

    // Called when the user clicks on the logout button
    logout: async () => {
        await supabase.auth.signOut();
    },

    // Called when the API returns an error
    checkError: async (error: { status?: number; message?: string }) => {
        if (error.status === 401 || error.status === 403) {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                // Return a rejected promise with message: false to suppress the error notification
                // and trigger an automatic redirect to the login page.
                return Promise.reject({ message: false });
            }
        }
    },

    // Called when the user navigates to a new location, to check for authentication
    checkAuth: async () => {
        const { data } = await supabase.auth.getUser();
        if (!data.user) {
            throw new Error("Not authenticated");
        }
    },

    // Called when the user navigates to a new location, to check for permissions
    getPermissions: async () => {
        const { data } = await supabase.auth.getUser();
        if (!data.user) return null;

        try {
            const profile = await api.get<UserProfile>(`/api/profiles?userId=${data.user.id}`);
            return profile?.role ?? "user";
        } catch (e) {
            console.warn("[AuthProvider] Failed to fetch permissions:", e);
        }

        return "user";
    },

    // Called to display the user's identity in the app bar
    getIdentity: async () => {
        const { data } = await supabase.auth.getUser();
        if (!data.user) throw new Error("Not authenticated");

        try {
            const profile = await api.get<UserProfile>(`/api/profiles?userId=${data.user.id}`);
            if (profile) {
                return {
                    id: data.user.id,
                    fullName: `${profile.first_name} ${profile.last_name}`,
                    avatar: undefined,
                };
            }
        } catch (e) {
            console.warn("[AuthProvider] Failed to fetch identity:", e);
        }

        return {
            id: data.user.id,
            fullName: data.user.email ?? "User",
            avatar: undefined,
        };
    },
};
