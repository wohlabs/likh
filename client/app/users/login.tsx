import ThemeText from "@/components/ThemeText";
import { useContext, useState } from "react";
import { View, StyleSheet, Linking } from "react-native";
import { TextInput } from "react-native-paper";
import ThemeButton from "@/components/ThemeButton";
import { router } from "expo-router";
import { AuthContext } from "@/context/AuthContext";
import api from "@/services/AxiosInstance";

export default function UserLogin() 
{
	const [username, setUsername] = useState<string>('');
	const [password, setPassword] = useState<string>('');
	const [error, setError] = useState('');
	const {login} = useContext(AuthContext);

	const userLogin = async () => 
	{
		try
		{
			const res = await api.post('/users/login', { username, password });
			login(res.data)
			
			router.navigate('/');
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
				<ThemeButton onPress={userLogin} mode="contained" style={{width: '100%'}}>Login</ThemeButton>
				<ThemeButton onPress={() => router.navigate('/users/register')}>Create new account</ThemeButton>
				<ThemeButton onPress={() => Linking.openURL('https://anilist.co/api/v2/oauth/authorize?client_id=30897&response_type=token')}>Login with Anilist</ThemeButton>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, justifyContent: 'center', padding: 20 },
	formContainer: {maxWidth: 500, width: '90%', height: "80%", margin: 'auto', alignItems: 'center', justifyContent: 'center'},
	input: { borderWidth: 1, marginBottom: 10, borderRadius: 5, width: '100%' },
	error: { color: 'red', marginBottom: 10 },
});