import { View, ScrollView, StyleSheet, Pressable, useColorScheme, Dimensions } from "react-native";
import { Stack, router } from "expo-router";
import ThemeText from "@/components/ThemeText";
import ThemeButton from "@/components/ThemeButton";
import { useTheme } from "react-native-paper";
import { useRef, useEffect, useState } from "react";
import Reanimated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, interpolate, Extrapolate } from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";

const { width, height } = Dimensions.get('window');

export default function LandingPage() {
	const theme = useTheme();
	const colorScheme = useColorScheme();
	const [scrollPosition, setScrollPosition] = useState(0);

	// Animation values
	const floatingAnim = useSharedValue(0);
	const rotateAnim = useSharedValue(0);
	const pulseAnim = useSharedValue(0);

	useEffect(() => {
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
		pulseAnim.value = withRepeat(
			withTiming(1, { duration: 2000 }),
			-1,
			true
		);
	}, []);

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

	const pulseStyle = useAnimatedStyle(() => ({
		opacity: interpolate(pulseAnim.value, [0, 1], [0.5, 1], Extrapolate.CLAMP),
	}));

	const handleScroll = (event: any) => {
		setScrollPosition(event.nativeEvent.contentOffset.y);
	};

	return (
		<>
			<Stack.Screen options={{headerShown: false}} />
			<ScrollView 
				style={[styles.container, {backgroundColor: theme.colors.background}]} 
				showsVerticalScrollIndicator={false}
				onScroll={handleScroll}
				scrollEventThrottle={16}
			>
				{/* Header */}
				<View style={styles.header}>
					<ThemeText style={[styles.logo, {color: theme.colors.primary}]}>likh</ThemeText>
					<ThemeButton 
						mode="text" 
						onPress={() => router.push('/users/login')}
						labelStyle={styles.loginLabel}
					>
						login
					</ThemeButton>
				</View>

				{/* Hero Section with 3D Effects */}
				<View style={[styles.heroSection, {backgroundColor: theme.colors.background}]}>
					{/* Animated Background Elements */}
					<View style={styles.backgroundGradient}>
						<Reanimated.View style={[styles.floatingOrb, rotateStyle, {
							backgroundColor: theme.colors.primary,
							opacity: 0.15,
						}]} />
						<Reanimated.View style={[styles.floatingOrb2, floatingStyle, {
							backgroundColor: theme.colors.secondary,
							opacity: 0.1,
						}]} />
						<Reanimated.View style={[styles.floatingOrb3, {
							backgroundColor: theme.colors.tertiary,
							opacity: 0.08,
						}]} />
					</View>

					{/* Hero Content */}
					<Reanimated.View style={[styles.heroContent, floatingStyle]}>
						<ThemeText style={[styles.heroTitle, {color: theme.colors.onBackground}]}>
							Track Your Story
						</ThemeText>
						<ThemeText style={[styles.heroSubtitle, {color: theme.colors.onSurface}]}>
							Capture every moment, every thought, every emotion from the manga you love
						</ThemeText>
						<View style={styles.ctaContainer}>
							<ThemeButton 
								mode="contained" 
								onPress={() => router.push('/users/register')}
								style={[styles.ctaButton, {backgroundColor: theme.colors.primary}]}
							>
								Start Your Journey
							</ThemeButton>
							<ThemeButton 
								mode="outlined" 
								onPress={() => router.push('/users/login')}
								style={styles.ctaButtonOutline}
								labelStyle={{color: theme.colors.primary}}
							>
								Sign In
							</ThemeButton>
						</View>
					</Reanimated.View>
				</View>

				{/* Features Showcase Section */}
				<View style={[styles.featuresShowcase, {backgroundColor: theme.colors.surface}]}>
					<View style={styles.featureShowcaseContent}>
						<ThemeText style={[styles.sectionTitle, {color: theme.colors.onBackground}]}>
							Designed for Manga Lovers
						</ThemeText>

						{/* Feature Cards with Depth */}
						<View style={styles.featureCardsContainer}>
							<Reanimated.View style={[styles.featureCard, pulseStyle, {backgroundColor: theme.colors.primaryContainer, borderColor: theme.colors.primary}]}>
								<View style={[styles.featureIconBg, {backgroundColor: theme.colors.primary}]}>
									<Feather name="pen-tool" size={24} color={theme.colors.onPrimary} />
								</View>
								<ThemeText style={[styles.featureCardTitle, {color: theme.colors.onBackground}]}>Note Taking</ThemeText>
								<ThemeText style={[styles.featureCardDesc, {color: theme.colors.onSurface}]}>Capture your thoughts instantly</ThemeText>
							</Reanimated.View>

							<Reanimated.View style={[styles.featureCard, {
								...pulseStyle,
								backgroundColor: theme.colors.secondaryContainer,
								borderColor: theme.colors.secondary,
							}]}>
								<View style={[styles.featureIconBg, {backgroundColor: theme.colors.secondary}]}>
									<Feather name="image" size={24} color={theme.colors.onSecondary} />
								</View>
								<ThemeText style={[styles.featureCardTitle, {color: theme.colors.onBackground}]}>Image Library</ThemeText>
								<ThemeText style={[styles.featureCardDesc, {color: theme.colors.onSurface}]}>Save your favorite panels</ThemeText>
							</Reanimated.View>

							<Reanimated.View style={[styles.featureCard, {
								...pulseStyle,
								backgroundColor: theme.colors.tertiaryContainer,
								borderColor: theme.colors.tertiary,
							}]}>
								<View style={[styles.featureIconBg, {backgroundColor: theme.colors.tertiary}]}>
									<Feather name="layers" size={24} color={theme.colors.onTertiary} />
								</View>
								<ThemeText style={[styles.featureCardTitle, {color: theme.colors.onBackground}]}>Organization</ThemeText>
								<ThemeText style={[styles.featureCardDesc, {color: theme.colors.onSurface}]}>Track chapters seamlessly</ThemeText>
							</Reanimated.View>
						</View>
					</View>
				</View>

				{/* Value Section with Staggered Cards */}
				<View style={[styles.valueSection, {backgroundColor: theme.colors.background}]}>
					<ThemeText style={[styles.sectionTitle, {color: theme.colors.onBackground, marginBottom: 32}]}>
						Why Choose likh?
					</ThemeText>

					<View style={styles.valueCardsContainer}>
						<View style={[styles.valueCard, {backgroundColor: theme.colors.surface, borderColor: theme.colors.surfaceVariant}]}>
							<View style={[styles.valueCardIcon, {backgroundColor: theme.colors.primaryContainer}]}>
								<ThemeText style={styles.valueCardIconText}>⚡</ThemeText>
							</View>
							<ThemeText style={[styles.valueCardTitle, {color: theme.colors.onBackground}]}>Lightning Fast</ThemeText>
							<ThemeText style={[styles.valueCardText, {color: theme.colors.onSurface}]}>No lag, no delays, just pure reading bliss</ThemeText>
						</View>

						<View style={[styles.valueCard, {backgroundColor: theme.colors.surface, borderColor: theme.colors.surfaceVariant}]}>
							<View style={[styles.valueCardIcon, {backgroundColor: theme.colors.secondaryContainer}]}>
								<ThemeText style={styles.valueCardIconText}>🎨</ThemeText>
							</View>
							<ThemeText style={[styles.valueCardTitle, {color: theme.colors.onBackground}]}>Beautiful Design</ThemeText>
							<ThemeText style={[styles.valueCardText, {color: theme.colors.onSurface}]}>Modern interface you'll love to use</ThemeText>
						</View>

						<View style={[styles.valueCard, {backgroundColor: theme.colors.surface, borderColor: theme.colors.surfaceVariant}]}>
							<View style={[styles.valueCardIcon, {backgroundColor: theme.colors.tertiaryContainer}]}>
								<ThemeText style={styles.valueCardIconText}>🔒</ThemeText>
							</View>
							<ThemeText style={[styles.valueCardTitle, {color: theme.colors.onBackground}]}>Privacy First</ThemeText>
							<ThemeText style={[styles.valueCardText, {color: theme.colors.onSurface}]}>Your notes, your data, always secure</ThemeText>
						</View>
					</View>
				</View>

				{/* CTA Section */}
				<View style={[styles.ctaSection, {backgroundColor: theme.colors.primary}]}>
					<ThemeText style={[styles.bottomTitle, {color: theme.colors.onPrimary}]}>
						Start Your Manga Journey
					</ThemeText>
					<ThemeText style={[styles.bottomSubtitle, {color: theme.colors.onPrimary}]}>
						Free forever. No credit card required.
					</ThemeText>
					<ThemeButton 
						mode="contained" 
						onPress={() => router.push('/users/register')}
						style={styles.largeCTA}
						buttonColor={theme.colors.onPrimary}
						labelStyle={{color: theme.colors.primary}}
					>
						Begin Now
					</ThemeButton>
				</View>

				{/* Footer */}
				<View style={[styles.footer, {backgroundColor: theme.colors.surface, borderTopColor: theme.colors.surfaceVariant}]}>
					<ThemeText style={[styles.footerText, {color: theme.colors.onSurface}]}>
						© 2025 likh. crafted for manga readers.
					</ThemeText>
				</View>
			</ScrollView>
		</>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: 20,
		paddingTop: 50,
		paddingBottom: 30,
	},
	logo: {
		fontSize: 28,
		fontWeight: "900",
		letterSpacing: 2,
	},
	loginLabel: {
		fontSize: 14,
		fontWeight: "600",
	},
	heroSection: {
		paddingHorizontal: 20,
		paddingVertical: 80,
		alignItems: "center",
		justifyContent: "center",
		position: "relative",
		minHeight: 600,
		overflow: "hidden",
	},
	backgroundGradient: {
		position: "absolute",
		width: "100%",
		height: "100%",
		top: 0,
		left: 0,
	},
	floatingOrb: {
		position: "absolute",
		width: 300,
		height: 300,
		borderRadius: 150,
		top: -100,
		right: -100,
	},
	floatingOrb2: {
		position: "absolute",
		width: 250,
		height: 250,
		borderRadius: 125,
		bottom: -80,
		left: -80,
	},
	floatingOrb3: {
		position: "absolute",
		width: 200,
		height: 200,
		borderRadius: 100,
		bottom: 100,
		right: 50,
	},
	heroContent: {
		zIndex: 1,
		alignItems: "center",
	},
	heroTitle: {
		fontSize: 56,
		fontWeight: "900",
		lineHeight: 64,
		marginBottom: 20,
		textAlign: "center",
	},
	heroSubtitle: {
		fontSize: 18,
		lineHeight: 28,
		marginBottom: 40,
		maxWidth: 360,
		textAlign: "center",
		fontWeight: "500",
	},
	ctaContainer: {
		flexDirection: "row",
		gap: 12,
		justifyContent: "center",
		flexWrap: "wrap",
	},
	ctaButton: {
		minWidth: 160,
		borderRadius: 12,
	},
	ctaButtonOutline: {
		minWidth: 160,
		borderRadius: 12,
		borderWidth: 2,
	},
	featuresShowcase: {
		paddingVertical: 60,
		marginVertical: 40,
	},
	featureShowcaseContent: {
		paddingHorizontal: 20,
	},
	featureCardsContainer: {
		gap: 16,
		marginTop: 24,
	},
	featureCard: {
		paddingVertical: 20,
		paddingHorizontal: 16,
		borderRadius: 16,
		borderWidth: 1,
		alignItems: "center",
	},
	featureIconBg: {
		width: 56,
		height: 56,
		borderRadius: 12,
		justifyContent: "center",
		alignItems: "center",
		marginBottom: 12,
	},
	featureCardTitle: {
		fontSize: 16,
		fontWeight: "700",
		marginBottom: 6,
		textAlign: "center",
	},
	featureCardDesc: {
		fontSize: 13,
		lineHeight: 18,
		textAlign: "center",
	},
	sectionTitle: {
		fontSize: 32,
		fontWeight: "900",
		marginBottom: 24,
		textAlign: "center",
	},
	valueSection: {
		paddingHorizontal: 20,
		paddingVertical: 50,
	},
	valueCardsContainer: {
		gap: 16,
	},
	valueCard: {
		paddingVertical: 24,
		paddingHorizontal: 16,
		borderRadius: 16,
		borderWidth: 1,
		alignItems: "center",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.08,
		shadowRadius: 12,
		elevation: 2,
	},
	valueCardIcon: {
		width: 64,
		height: 64,
		borderRadius: 12,
		justifyContent: "center",
		alignItems: "center",
		marginBottom: 16,
	},
	valueCardIconText: {
		fontSize: 32,
	},
	valueCardTitle: {
		fontSize: 18,
		fontWeight: "700",
		marginBottom: 8,
		textAlign: "center",
	},
	valueCardText: {
		fontSize: 14,
		lineHeight: 20,
		textAlign: "center",
	},
	ctaSection: {
		paddingVertical: 60,
		paddingHorizontal: 20,
		alignItems: "center",
		marginVertical: 40,
		borderRadius: 20,
	},
	bottomTitle: {
		fontSize: 32,
		fontWeight: "900",
		textAlign: "center",
		marginBottom: 12,
		lineHeight: 40,
	},
	bottomSubtitle: {
		fontSize: 16,
		textAlign: "center",
		marginBottom: 32,
		fontWeight: "500",
	},
	largeCTA: {
		minWidth: 200,
		borderRadius: 12,
	},
	bottomText: {
		fontSize: 13,
		fontWeight: "500",
	},
	footer: {
		paddingHorizontal: 20,
		paddingVertical: 30,
		alignItems: "center",
		borderTopWidth: 1,
		marginBottom: 20,
	},
	footerText: {
		fontSize: 12,
		fontWeight: "500",
	},
});
