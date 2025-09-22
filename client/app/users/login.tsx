import ThemeText from "@/components/ThemeText";
import { useContext, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import axios from 'axios'
import { TextInput } from "react-native-paper";
import ThemeButton from "@/components/ThemeButton";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function UserLogin() {
	const [username, setUsername] = useState<string>('');
	const [password, setPassword] = useState<string>('');
	const [error, setError] = useState('');

	const login = async () => {
		try
		{
			const res = await axios.post('http://localhost:3000/users/login', { username, password });
			const token = res.data.token;
			// Store token in coookie
			await AsyncStorage.setItem("token", token)
			router.push('/');
		}
		catch (err: any)
		{
			setError(err.response.data.error);
		}
	};
	return (
		<View style={styles.container}>
			<View style={styles.formContainer}>
				<ThemeText style={{fontSize: 20}}>Login</ThemeText>
				<TextInput label='username' placeholder="username" value={username} onChangeText={setUsername} style={styles.input} />
				<TextInput label='password' placeholder="password" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
				{error ? <ThemeText style={styles.error}>{error}</ThemeText> : null}
				<ThemeButton onPress={login} mode="contained" style={{width: '100%'}}>Login</ThemeButton>
				<ThemeButton onPress={() => router.push('/users/register')}>Create new account</ThemeButton>
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