import api from "@/services/AxiosInstance";
import ThemeButton from "@/components/ThemeButton";
import ThemeText from "@/components/ThemeText";
import { router } from "expo-router";
import { useContext, useState } from "react";
import { View, StyleSheet } from "react-native";
import { TextInput } from "react-native-paper";
import { registerUser } from "@/services/users.service";
import { AuthContext } from "@/context/AuthContext";

export default function UserRegister()
{
	const [username, setUsername] = useState<string>('');
	const [password, setPassword] = useState<string>('');
	const [error, setError] = useState('');
	const {token} = useContext(AuthContext);

	const register = async () => 
	{
		const result = await registerUser(username, password);

		if (!result.success)
		{
			setError(result.error);
			return;
		}
	};

	if (token)
	{
		console.log("Already logged in, navigating to protected area");
		router.navigate('/app');
	}
	return (
		<View style={styles.container}>
			<View style={styles.formContainer}>
				<ThemeText variant="headlineSmall">Register</ThemeText>
				<TextInput label='username' placeholder="username" value={username} onChangeText={setUsername} mode="outlined" style={styles.input} />
				<TextInput label='password' placeholder="password" value={password} onChangeText={setPassword} mode="outlined" secureTextEntry style={styles.input} />
				{error ? <ThemeText style={styles.error}>{error}</ThemeText> : null}
				<ThemeButton onPress={register} mode="contained" style={{width: '100%'}}>Register</ThemeButton>
				<ThemeButton onPress={() => router.navigate('/users/login')}>Already have an account?</ThemeButton>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, justifyContent: 'center', padding: 20 },
	formContainer: {width: 500, height: "80%", margin: 'auto', alignItems: 'center', justifyContent: 'center'},
	input: { marginBottom: 10, borderRadius: 5, width: '100%' },
	error: { color: 'red', marginBottom: 10 },
});