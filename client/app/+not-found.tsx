import ThemeText from '@/components/ThemeText';
import { View } from 'react-native';
import { Image } from "expo-image";

export default function NotFoundPage()
{
	return (
		<View style={{flex: 1, alignContent: 'center', alignItems: "center", justifyContent: 'center', flexDirection: "column"}}>
			<ThemeText style={{textAlign: "center", fontWeight: 'bold', fontSize: 150}}>404</ThemeText>
			<ThemeText variant='headlineSmall'>
				oops... page not found
			</ThemeText>
			<Image
				source={ Math.floor(Math.random() * 2) === 0 ? require("../assets/images/404_not_found.png") : require("../assets/images/500_internal_server_error.png")}
				contentFit='contain'
				style={{height: "50%", aspectRatio: 1, marginLeft: 75}}
			/>
		</View>
	)
}