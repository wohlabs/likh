import ThemeText from "@/components/ThemeText";
import { useContext, useState } from "react";
import { View, StyleSheet } from "react-native";
import { TextInput, useTheme } from "react-native-paper";
import ThemeButton from "@/components/ThemeButton";
import { router } from "expo-router";
import { AuthContext } from "@/context/AuthContext";
import { loginUser } from "@/services/users.service";
import { Image } from "expo-image";

export default function UserLogin() 
{
	const [username, setUsername] = useState<string>('');
	const [password, setPassword] = useState<string>('');
	const [error, setError] = useState('');
	const {login} = useContext(AuthContext);
	const theme = useTheme()

	const userLogin = async () => 
	{
		const result = await loginUser(username, password);
		if (!result.success)
		{
			setError(result.error);
			return;
		}

		await login(result.data)
	};

	return (
		<View style={styles.container}>
			<View style={styles.formContainer}>
				{/* <Image
					source={require("../../assets/images/likh.png")}
					contentFit='contain'
					style={{height: 200, aspectRatio: 1}}
				/> */}
				<ThemeText
					style={[{
						fontWeight: "900",
						letterSpacing: 2,
						color: theme.colors.primary,
						marginBottom: 20
					}]}
					variant="displayMedium"
					onPress={() => router.navigate("/")}
				>
					likh
				</ThemeText>
				<ThemeText variant="headlineSmall">Login</ThemeText>
				<TextInput label='username' placeholder="username" value={username} onChangeText={setUsername} style={styles.input} mode="outlined" />
				<TextInput label='password' placeholder="password" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} mode="outlined" />
				{error ? <ThemeText style={styles.error}>{error}</ThemeText> : null}
				<ThemeButton onPress={userLogin} mode="contained" style={{width: '100%'}}>Login</ThemeButton>
				<ThemeButton onPress={() => router.navigate('/users/register')}>Create new account</ThemeButton>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, justifyContent: 'center', padding: 20 },
	formContainer: {maxWidth: 500, width: '90%', height: "80%", margin: 'auto', alignItems: 'center', justifyContent: 'center'},
	input: { marginBottom: 10, borderRadius: 5, width: '100%' },
	error: { color: 'red', marginBottom: 10 },
});