import ThemeButton from "@/components/ThemeButton";
import ThemeText from "@/components/ThemeText";
import { AuthContext } from "@/context/AuthContext";
import { usePersistentTheme } from "@/context/usePersistentTheme";
import { loginUser } from "@/services/users.service";
import { router } from "expo-router";
import { useContext, useState } from "react";
import { StyleSheet, View , TextInput } from "react-native";

export default function UserLogin() 
{
	const [username, setUsername] = useState<string>('');
	const [password, setPassword] = useState<string>('');
	const [error, setError] = useState('');
	const {login} = useContext(AuthContext);

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
					className="text-4xl text-primary font-extrabold tracking-wider mb-5"
					onPress={() => router.navigate("/")}
				>
					likh
				</ThemeText>
				<ThemeText className="text-xl m-1 font-medium">Login</ThemeText>
				<View className="w-full mb-2">
					<ThemeText className="text-md">Username</ThemeText>
					<TextInput placeholder="username" className="bg-transparent w-full p-2 rounded-md text-md border-2 text-onBackground border-inverseSurface" value={username} onChangeText={setUsername} />
				</View>
				<View className="w-full mb-2">
					<ThemeText className="text-md">Password</ThemeText>
					<TextInput placeholder="password" className="bg-transparent w-full p-2 rounded-md text-md text-onBackground border-2 border-inverseSurface"  value={password} onChangeText={setPassword} secureTextEntry />
				</View>
				<ThemeText className="text-statusError mb-2.5 w-full text-center">{error}</ThemeText>
				<ThemeButton onPress={userLogin} className="text-sm w-full" mode="contained">Login</ThemeButton>
				<ThemeButton onPress={() => router.navigate('/users/register')} className="text-sm w-full" >Create new account</ThemeButton>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, justifyContent: 'center', padding: 20 },
	formContainer: {maxWidth: 500, width: '90%', height: "80%", margin: 'auto', alignItems: 'center', justifyContent: 'center'},
});