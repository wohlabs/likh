import ThemeButton from "@/components/ThemeButton";
import ThemeText from "@/components/ThemeText";
import { usePersistentTheme } from "@/context/usePersistentTheme";
import { registerUser } from "@/services/users.service";
import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { TextInput } from "react-native";

export default function UserRegister()
{
	const [username, setUsername] = useState<string>('');
	const [password, setPassword] = useState<string>('');
	const [error, setError] = useState('');
	const {theme} = usePersistentTheme()

	const register = async () => 
	{
		const result = await registerUser(username, password);

		if (result.success)
		{
			router.navigate("/users/login")
		}
		else
		{
			setError(result.error);
			return;
		}
	};

	return (
		<View style={styles.container}>
			<View style={styles.formContainer}>
				<ThemeText
					className="text-4xl text-primary font-extrabold tracking-wider mb-5"
					onPress={() => router.navigate("/")}
				>
					likh
				</ThemeText>
				<ThemeText className="text-xl m-1 font-medium">Register</ThemeText>
				<View className="w-full mb-2">
					<ThemeText className="text-md">Username</ThemeText>
					<TextInput placeholder="username" className="bg-transparent w-full p-2 rounded-md text-md text-onBackground border-2 border-inverseSurface" value={username} onChangeText={setUsername} />
				</View>
				<View className="w-full mb-2">
					<ThemeText className="text-md">Password</ThemeText>
					<TextInput placeholder="password" className="bg-transparent w-full p-2 rounded-md text-md text-onBackground border-2 border-inverseSurface" value={password} onChangeText={setPassword} secureTextEntry />
				</View>
				{error ? <ThemeText style={styles.error}>{error}</ThemeText> : null}
				<ThemeButton onPress={register} className="text-sm w-full" mode="contained">Register</ThemeButton>
				<ThemeButton onPress={() => router.navigate('/users/login')} className="text-sm w-full" mode="text">Already have an account?</ThemeButton>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, justifyContent: 'center', padding: 20 },
	formContainer: {maxWidth: 500, width: '90%', height: "80%", margin: 'auto', alignItems: 'center', justifyContent: 'center'},
	error: { color: 'red', marginBottom: 10, width: '100%' },
});