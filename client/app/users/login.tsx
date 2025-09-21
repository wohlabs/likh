import ThemeText from "@/components/ThemeText";
import { View, Text } from "react-native";

export default function UserLogin() {

	return (
		<View style={{flex:1}}>
			<View style={{width: "80%", height: "80%", margin: "auto"}}>
				<ThemeText>Hello, login here</ThemeText>
			</View>
		</View>
	);
}