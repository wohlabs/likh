import ThemeText from '@/components/ThemeText';
import { Image } from "expo-image";
import { View } from 'react-native';

export default function NotFoundPage()
{
	return (
		<View style={{flex: 1, alignContent: 'center', alignItems: "center", justifyContent: 'center', flexDirection: "column"}}>
			<ThemeText style={{textAlign: "center", fontWeight: 'bold', fontSize: 150}}>404</ThemeText>
			<ThemeText>
				oops... page not found
			</ThemeText>
			<Image
				source={require("../assets/images/404_not_found.png")}
				contentFit='contain'
				style={{height: "50%", aspectRatio: 1, marginLeft: 75}}
			/>
		</View>
	)
}