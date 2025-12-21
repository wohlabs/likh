import { AuthContext } from "@/context/AuthContext";
import { useContext } from "react";
import { Redirect, Stack } from "expo-router";
import { useTheme } from "react-native-paper";

export default function ProtectedLayout() 
{
	const theme = useTheme()
	const {token} = useContext(AuthContext);
	if (!token)
	{
		console.log("No token, redirecting to login");
		return <Redirect href={'/users/login'} />;  // splash or spinner
	}

	return (
		<Stack screenOptions={{
			headerShown: false,
			contentStyle: {backgroundColor: theme.colors.background},
			headerStyle: {backgroundColor: theme.colors.surfaceVariant},
			headerTintColor: theme.colors.onSurface
		}}/>
	);
}