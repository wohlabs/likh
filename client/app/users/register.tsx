import api from "@/services/AxiosInstance";
import ThemeButton from "@/components/ThemeButton";
import ThemeText from "@/components/ThemeText";
import { router } from "expo-router";
import { useState } from "react";
import { View, StyleSheet } from "react-native";
import { TextInput } from "react-native-paper";

export default function UserRegister()
{
	const [username, setUsername] = useState<string>('');
	const [password, setPassword] = useState<string>('');
	const [error, setError] = useState('');

	const register = async () => 
	{
		try
		{
			await api.post('/users', { username, password });
			router.navigate('/users/login');
		}
		catch (err: any)
		{
			setError(err.response.data.error);
		}
	};

	return (
		<View style={styles.container}>
			<View style={styles.formContainer}>
				<ThemeText style={{fontSize: 20}}>Register</ThemeText>
				<TextInput label='username' placeholder="username" value={username} onChangeText={setUsername} style={styles.input} />
				<TextInput label='password' placeholder="password" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
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
	input: { borderWidth: 1, marginBottom: 10, borderRadius: 5, width: '100%' },
	error: { color: 'red', marginBottom: 10 },
});