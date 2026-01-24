import { useEffect } from "react";
import { useRouter } from "expo-router";

export default function AppIndexRedirect() {
	const router = useRouter();

	useEffect(() => {
		router.replace("/app/home"); // redirect /app → /app/home
	}, []);

	return null; // or a loading spinner
}
