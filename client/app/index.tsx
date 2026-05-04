import ThemeButton from "@/components/ThemeButton";
import ThemeText from "@/components/ThemeText";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect } from "react";
import { ScrollView, View } from "react-native";
import Reanimated, { Extrapolate, interpolate, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import "../global.css"

export default function LandingPage() 
{
	// Animation values
	const floatingAnim = useSharedValue(0);
	const rotateAnim = useSharedValue(0);
	const pulse = useSharedValue(0);
	const activeIndex = useSharedValue(0);

	const ITEM_COUNT = 3;
	
	useEffect(() => 
	{
		const runPulse = () => 
		{
			pulse.value = 0;

			pulse.value = withSequence(
				withTiming(1, { duration: 3000 }),
				withTiming(0, { duration: 3000 }, (finished) => 
				{
					if (finished) 
					{
						activeIndex.value = (activeIndex.value + 1) % ITEM_COUNT;
						runPulse();
					}
				})
			);
		};

	  runPulse();
	}, [activeIndex, pulse]);

	useEffect(() => 
	{
		floatingAnim.value = withRepeat(
			withTiming(1, { duration: 3000 }),
			-1,
			true
		);
		rotateAnim.value = withRepeat(
			withTiming(1, { duration: 8000 }),
			-1,
			false
		);
	}, [floatingAnim, rotateAnim])

	const floatingStyle = useAnimatedStyle(() => ({
		transform: [
			{
				translateY: interpolate(floatingAnim.value, [0, 1], [0, -20], Extrapolate.CLAMP),
			},
		],
	}));

	const rotateStyle = useAnimatedStyle(() => ({
		transform: [
			{
				rotate: `${interpolate(rotateAnim.value, [0, 1], [0, 360], Extrapolate.CLAMP)}deg`,
			},
		],
	}));

	const usePulseStyle = (index: number) =>
	  useAnimatedStyle(() => 
		{
			const isActive = activeIndex.value === index;

			return {
		  opacity: isActive
					? interpolate(pulse.value, [0, 1], [0.5, 1])
					: 0.5,
			};
		});

	const year = new Date().getFullYear();

	return (
		<>
			<ScrollView 
				className="flex-1 bg-background"
				showsVerticalScrollIndicator={false}
				scrollEventThrottle={16}
			>
				{/* Header */}
				<View className="flex-row justify-between items-center px-5 pt-12.5 pb-7.5">
					<ThemeText className="text-onBackground text-3xl font-extrabold tracking-wider">likh</ThemeText>
					<ThemeButton 
						className="text-md font-medium"
						mode="text" 
						onPress={() => router.push('/users/login')}
					>
						login
					</ThemeButton>
				</View>

				{/* Hero Section with 3D Effects */}
				<View className="px-5 py-20 items-center justify-center relative min-h-150 overflow-hidden bg-background" >
					{/* Animated Background Elements */}
					<View className="absolute w-full h-full top-0 left-0">
						<Reanimated.View className="absolute w-75 h-75 rounded-full -top-25 -right-25 bg-primary opacity-15" style={[rotateStyle]} />
						<Reanimated.View className="absolute w-62.5 h-62.5 rounded-full -bottom-20 -left-20 bg-secondary opacity-10" style={[floatingStyle]} />
						<Reanimated.View className="absolute w-50 h-50 rounded-full bottom-25 right-12.5 bg-tertiary" />
					</View>

					{/* Hero Content */}
					<Reanimated.View className="z-10 items-center" style={floatingStyle}>
						<ThemeText className="text-onBackground text-5xl font-black text-center mb-5 leading-tight">
							Track Your Story
						</ThemeText>
						<ThemeText className="text-onSurface text-lg text-center mb-10 max-w-90 font-medium leading-relaxed">
							Capture every moment, every thought, every emotion from the manga you love
						</ThemeText>
						<View className="flex-row gap-3 justify-center flex-wrap">
							<ThemeButton 
								mode="contained" 
								onPress={() => router.push('/users/login')}
								className="min-w-40 rounded-2xl"

							>
								Start Your Journey
							</ThemeButton>
						</View>
					</Reanimated.View>
				</View>

				{/* Features Showcase Section */}
				<View className="py-15 my-10 bg-surface">
					<View className="px-5">
						<ThemeText className="text-onBackground text-3xl font-black text-center mb-6">
							Designed for Manga Lovers
						</ThemeText>

						{/* Feature Cards with Depth */}
						<View className="gap-4 mt-6">
							<Reanimated.View className="py-5 px-4 rounded-3xl border border-primary bg-primaryContainer items-center" style={[usePulseStyle(0)]}>
								<View className="w-14 h-14 rounded-2xl justify-center items-center mb-3 bg-primary">
									<Feather name="pen-tool" size={24} color="white" />
								</View>
								<ThemeText className="text-onBackground text-base font-bold text-center">Note Taking</ThemeText>
								<ThemeText className="text-onSurface text-sm text-center mt-1 leading-relaxed">Capture your thoughts instantly</ThemeText>
							</Reanimated.View>
							<Reanimated.View className="py-5 px-4 rounded-3xl border border-secondary bg-secondaryContainer items-center" style={[usePulseStyle(1)]}>
								<View className="w-14 h-14 rounded-2xl justify-center items-center mb-3 bg-secondary">
									<Feather name="image" size={24} color="white" />
								</View>
								<ThemeText className="text-onBackground text-base font-bold text-center">Image Library</ThemeText>
								<ThemeText className="text-onSurface text-sm text-center mt-1 leading-relaxed">Save your favorite panels</ThemeText>
							</Reanimated.View>
							<Reanimated.View className="py-5 px-4 rounded-3xl border border-tertiary bg-tertiaryContainer items-center" style={[usePulseStyle(2)]}>
								<View className="w-14 h-14 rounded-2xl justify-center items-center mb-3 bg-tertiary">
									<Feather name="layers" size={24} color="white" />
								</View>
								<ThemeText className="text-onBackground text-base font-bold text-center">Organization</ThemeText>
								<ThemeText className="text-onSurface text-sm text-center mt-1 leading-relaxed">Track chapters seamlessly</ThemeText>
							</Reanimated.View>
						</View>
					</View>
				</View>

				{/* Value Section with Staggered Cards */}
				<View className="px-5 py-12.5 bg-background">
					<ThemeText className="text-onBackground text-3xl font-black text-center mb-8">
					</ThemeText>

					<View className="gap-4">
						<View className="py-6 px-4 rounded-3xl border border-surfaceVariant bg-surface items-center shadow-sm">
							<View className="w-16 h-16 rounded-2xl justify-center items-center mb-4 bg-primaryContainer">
								<ThemeText className="text-4xl">⚡</ThemeText>
							</View>
							<ThemeText className="text-onBackground text-lg font-bold text-center mb-2">Lightning Fast</ThemeText>
							<ThemeText className="text-onSurface text-sm text-center leading-relaxed">No lag, no delays, just pure reading bliss</ThemeText>
						</View>

						<View className="py-6 px-4 rounded-3xl border border-surfaceVariant bg-surface items-center shadow-sm">
							<View className="w-16 h-16 rounded-2xl justify-center items-center mb-4 bg-secondaryContainer">
								<ThemeText className="text-4xl">🎨</ThemeText>
							</View>
							<ThemeText className="text-onBackground text-lg font-bold text-center mb-2">Beautiful Design</ThemeText>
							<ThemeText className="text-onSurface text-sm text-center leading-relaxed">Modern interface you&#39;ll love to use</ThemeText>
						</View>

						<View className="py-6 px-4 rounded-3xl border border-surfaceVariant bg-surface items-center shadow-sm">
							<View className="w-16 h-16 rounded-2xl justify-center items-center mb-4 bg-tertiaryContainer">
								<ThemeText className="text-4xl">🔒</ThemeText>
							</View>
							<ThemeText className="text-onBackground text-lg font-bold text-center mb-2">Privacy First</ThemeText>
							<ThemeText className="text-onSurface text-sm text-center leading-relaxed">Your notes, your data, always secure</ThemeText>
						</View>
					</View>
				</View>

				{/* CTA Section */}
				<View className="py-15 px-5 items-center my-10 rounded-3xl bg-primary">
					<ThemeText className="text-onPrimary text-3xl font-black text-center mb-3 leading-tight">
					Start Your Manga Journey
					</ThemeText>
					<ThemeText className="text-onPrimary text-base text-center mb-8 font-medium">
					Free forever. No credit card required.
					</ThemeText>
					<ThemeButton 
						mode="contained" 
						onPress={() => router.push('/users/register')}
						className="min-w-50 rounded-2xl"
					>
						Begin Now
					</ThemeButton>
				</View>

				{/* Footer */}
				<View className="px-5 py-7.5 items-center border-t border-t-surfaceVariant bg-surface mb-5">
					<ThemeText className="text-onSurface text-xs font-medium">
						©{year} likh. crafted for manga readers.
					</ThemeText>
				</View>
			</ScrollView>
		</>
	);
}

