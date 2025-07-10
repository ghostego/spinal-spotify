'use client'

import React, { createContext, useContext, useEffect, useState } from "react";

// set up the interface for our auth context
interface AuthContextType {
	accessToken: string | null;
	refreshToken: string | null;
	profile: any;
	setAuthData: (data: {
		accessToken: string;
		refreshToken: string;
		profile: any;
	}) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
	const [accessToken, setAccessToken] = useState<string | null>(null);
	const [refreshToken, setRefreshToken] = useState<string | null>(null);
	const [profile, setProfile] = useState<any>(null);

	useEffect(() => {
		const token = localStorage.getItem("accessToken");
		const refresh = localStorage.getItem("refresh_token");
		const profile = localStorage.getItem("profile")

		if (token) setAccessToken(token)
		if (refresh) setRefreshToken(refresh)
		if (profile) setProfile(profile)
	}, [])

	const setAuthData = ({accessToken, refreshToken, profile}: any) => {
		setAccessToken(accessToken)
		setRefreshToken(refreshToken)
		setProfile(profile)
		localStorage.setItem("accessToken", accessToken)
		localStorage.setItem("refresh_token", refreshToken)
		localStorage.setItem("profile", JSON.stringify(profile))
	}

	return (
		<AuthContext.Provider value={{accessToken, refreshToken, profile, setAuthData}}>
			{children}
		</AuthContext.Provider>
	)
};

export const useAuth = () => {
	const ctx = useContext(AuthContext);
	if (!ctx) throw new Error("useAuth must be used within AuthProvider")
	return ctx;
}