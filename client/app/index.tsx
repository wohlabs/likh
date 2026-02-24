import ThemeButton from "@/components/ThemeButton";
import ThemeText from "@/components/ThemeText";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { useTheme } from "react-native-paper";
import Reanimated, { Extrapolate, interpolate, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import "../global.css"
import { themes, usePersistentTheme } from "@/context/usePersistentTheme";

export default function LandingPage() 
{
	const theme = useTheme();
	const [scrollPosition, setScrollPosition] = useState(0);
	const { themeScheme } = usePersistentTheme()

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

	// Helper to get theme-based classes
	const getColorClasses = (colorKey: keyof typeof theme.colors, opacity?: number) => 
	{
		const color = theme.colors[colorKey];
		return { backgroundColor: color, opacity: opacity || 1 };
	};

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


	const handleScroll = (event: any) => 
	{
		setScrollPosition(event.nativeEvent.contentOffset.y);
	};

	const year = new Date().getFullYear();

	return (
		<>
			<ScrollView 
				className="flex-1 bg-background"
				showsVerticalScrollIndicator={false}
				onScroll={handleScroll}
				scrollEventThrottle={16}
			>
				{/* Header */}
				<View className="flex-row justify-between items-center px-5 pt-12.5 pb-7.5">
					<ThemeText className="text-onBackground text-3xl font-extrabold tracking-wider">likh</ThemeText>
					<ThemeButton 
						mode="text" 
						onPress={() => router.push('/users/login')}
						labelStyle={{fontSize: 14, fontWeight: '600'}}
					>
						login
					</ThemeButton>
				</View>

				{/* Hero Section with 3D Effects */}
				<View className="px-5 py-20 items-center justify-center relative min-h-150 overflow-hidden" style={{backgroundColor: theme.colors.background}}>
					{/* Animated Background Elements */}
					<View className="absolute w-full h-full top-0 left-0">
						<Reanimated.View className="absolute w-75 h-75 rounded-full -top-25 -right-25" style={[rotateStyle, {
							backgroundColor: theme.colors.primary,
							opacity: 0.15,
						}]} />
						<Reanimated.View className="absolute w-62.5 h-62.5 rounded-full -bottom-20 -left-20" style={[floatingStyle, {
							backgroundColor: theme.colors.secondary,
							opacity: 0.1,
						}]} />
						<Reanimated.View className="absolute w-50 h-50 rounded-full bottom-25 right-12.5" style={{
							backgroundColor: theme.colors.tertiary,
							opacity: 0.08,
						}} />
					</View>

					{/* Hero Content */}
					<Reanimated.View className="z-10 items-center" style={floatingStyle}>
						<ThemeText className="text-onBackground text-5xl font-black text-center mb-5 leading-tight" style={{fontSize: 56, lineHeight: 64}}>
							Track Your Story
						</ThemeText>
						<ThemeText className="text-onSurface text-lg text-center mb-10 max-w-90 font-medium" style={{fontSize: 18, lineHeight: 28}}>
							Capture every moment, every thought, every emotion from the manga you love
						</ThemeText>
						<View className="flex-row gap-3 justify-center flex-wrap">
							<ThemeButton 
								mode="contained" 
								onPress={() => router.push('/users/login')}
								className="min-w-40 rounded-2xl"
								style={{backgroundColor: theme.colors.primary}}
							>
								Start Your Journey
							</ThemeButton>
						</View>
					</Reanimated.View>
				</View>

				{/* Features Showcase Section */}
				<View className="py-15 my-10" style={{backgroundColor: theme.colors.surface}}>
					<View className="px-5">
						<ThemeText className="text-onBackground text-3xl font-black text-center mb-6" style={{color: theme.colors.onBackground}}>
							Designed for Manga Lovers
						</ThemeText>

						{/* Feature Cards with Depth */}
						<View className="gap-4 mt-6">
							<Reanimated.View className="py-5 px-4 rounded-3xl border items-center" style={[usePulseStyle(0), {
								backgroundColor: theme.colors.primaryContainer,
								borderColor: theme.colors.primary,
								borderWidth: 1,
							}]}>
								<View className="w-14 h-14 rounded-2xl justify-center items-center mb-3" style={{backgroundColor: theme.colors.primary}}>
									<Feather name="pen-tool" size={24} color={theme.colors.onPrimary} />
								</View>
								<ThemeText className="text-onBackground text-base font-bold text-center" style={{color: theme.colors.onBackground}}>Note Taking</ThemeText>
								<ThemeText className="text-onSurface text-sm text-center mt-1" style={{color: theme.colors.onSurface, lineHeight: 18}}>Capture your thoughts instantly</ThemeText>
							</Reanimated.View>
							<Reanimated.View className="py-5 px-4 rounded-3xl border items-center" style={[usePulseStyle(1), {
								backgroundColor: theme.colors.secondaryContainer,
								borderColor: theme.colors.secondary,
								borderWidth: 1,
							}]}>
								<View className="w-14 h-14 rounded-2xl justify-center items-center mb-3" style={{backgroundColor: theme.colors.secondary}}>
									<Feather name="image" size={24} color={theme.colors.onSecondary} />
								</View>
								<ThemeText className="text-onBackground text-base font-bold text-center" style={{color: theme.colors.onBackground}}>Image Library</ThemeText>
								<ThemeText className="text-onSurface text-sm text-center mt-1" style={{color: theme.colors.onSurface, lineHeight: 18}}>Save your favorite panels</ThemeText>
							</Reanimated.View>
							<Reanimated.View className="py-5 px-4 rounded-3xl border items-center" style={[usePulseStyle(2), {
								backgroundColor: theme.colors.tertiaryContainer,
								borderColor: theme.colors.tertiary,
								borderWidth: 1,
							}]}>
								<View className="w-14 h-14 rounded-2xl justify-center items-center mb-3" style={{backgroundColor: theme.colors.tertiary}}>
									<Feather name="layers" size={24} color={theme.colors.onTertiary} />
								</View>
								<ThemeText className="text-onBackground text-base font-bold text-center" style={{color: theme.colors.onBackground}}>Organization</ThemeText>
								<ThemeText className="text-onSurface text-sm text-center mt-1" style={{color: theme.colors.onSurface, lineHeight: 18}}>Track chapters seamlessly</ThemeText>
							</Reanimated.View>
						</View>
					</View>
				</View>

				{/* Value Section with Staggered Cards */}
				<View className="px-5 py-12.5" style={{backgroundColor: theme.colors.background}}>
					<ThemeText className="text-onBackground text-3xl font-black text-center mb-8" style={{color: theme.colors.onBackground}}>
						Why Choose likh?
					</ThemeText>

					<View className="gap-4">
						<View className="py-6 px-4 rounded-3xl border items-center shadow-sm" style={{
							backgroundColor: theme.colors.surface,
							borderColor: theme.colors.surfaceVariant,
							borderWidth: 1,
							shadowColor: '#000',
							shadowOffset: { width: 0, height: 4 },
							shadowOpacity: 0.08,
							shadowRadius: 12,
							elevation: 2,
						}}>
							<View className="w-16 h-16 rounded-2xl justify-center items-center mb-4" style={{backgroundColor: theme.colors.primaryContainer}}>
								<ThemeText className="text-4xl">⚡</ThemeText>
							</View>
							<ThemeText className="text-onBackground text-lg font-bold text-center mb-2" style={{color: theme.colors.onBackground}}>Lightning Fast</ThemeText>
							<ThemeText className="text-onSurface text-sm text-center" style={{color: theme.colors.onSurface, lineHeight: 20}}>No lag, no delays, just pure reading bliss</ThemeText>
						</View>

						<View className="py-6 px-4 rounded-3xl border items-center shadow-sm" style={{
							backgroundColor: theme.colors.surface,
							borderColor: theme.colors.surfaceVariant,
							borderWidth: 1,
							shadowColor: '#000',
							shadowOffset: { width: 0, height: 4 },
							shadowOpacity: 0.08,
							shadowRadius: 12,
							elevation: 2,
						}}>
							<View className="w-16 h-16 rounded-2xl justify-center items-center mb-4" style={{backgroundColor: theme.colors.secondaryContainer}}>
								<ThemeText className="text-4xl">🎨</ThemeText>
							</View>
							<ThemeText className="text-onBackground text-lg font-bold text-center mb-2" style={{color: theme.colors.onBackground}}>Beautiful Design</ThemeText>
							<ThemeText className="text-onSurface text-sm text-center" style={{color: theme.colors.onSurface, lineHeight: 20}}>Modern interface you&#39;ll love to use</ThemeText>
						</View>

						<View className="py-6 px-4 rounded-3xl border items-center shadow-sm" style={{
							backgroundColor: theme.colors.surface,
							borderColor: theme.colors.surfaceVariant,
							borderWidth: 1,
							shadowColor: '#000',
							shadowOffset: { width: 0, height: 4 },
							shadowOpacity: 0.08,
							shadowRadius: 12,
							elevation: 2,
						}}>
							<View className="w-16 h-16 rounded-2xl justify-center items-center mb-4" style={{backgroundColor: theme.colors.tertiaryContainer}}>
								<ThemeText className="text-4xl">🔒</ThemeText>
							</View>
							<ThemeText className="text-onBackground text-lg font-bold text-center mb-2" style={{color: theme.colors.onBackground}}>Privacy First</ThemeText>
							<ThemeText className="text-onSurface text-sm text-center" style={{color: theme.colors.onSurface, lineHeight: 20}}>Your notes, your data, always secure</ThemeText>
						</View>
					</View>
				</View>

				{/* CTA Section */}
				<View className="py-15 px-5 items-center my-10 rounded-3xl" style={{backgroundColor: theme.colors.primary}}>
					<ThemeText className="text-onPrimary text-3xl font-black text-center mb-3 leading-tight" style={{color: theme.colors.onPrimary, fontSize: 32, lineHeight: 40}}>
						Start Your Manga Journey
					</ThemeText>
					<ThemeText className="text-onPrimary text-base text-center mb-8 font-medium" style={{color: theme.colors.onPrimary}}>
						Free forever. No credit card required.
					</ThemeText>
					<ThemeButton 
						mode="contained" 
						onPress={() => router.push('/users/register')}
						className="min-w-50 rounded-2xl"
						buttonColor={theme.colors.onPrimary}
						labelStyle={{color: theme.colors.primary}}
					>
						Begin Now
					</ThemeButton>
				</View>

				{/* Footer */}
				<View className="px-5 py-7.5 items-center border-t mb-5" style={{
					backgroundColor: theme.colors.surface,
					borderTopColor: theme.colors.surfaceVariant,
					borderTopWidth: 1,
				}}>
					<ThemeText className="text-onSurface text-xs font-medium" style={{color: theme.colors.onSurface}}>
						© <span>{year}</span> likh. crafted for manga readers.
					</ThemeText>
				</View>
			</ScrollView>
		</>
	);
}

