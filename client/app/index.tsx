import { View, ScrollView, StyleSheet, Pressable, useColorScheme } from "react-native";
import { Stack, router } from "expo-router";
import ThemeText from "@/components/ThemeText";
import ThemeButton from "@/components/ThemeButton";
import { useTheme } from "react-native-paper";

export default function LandingPage() {
	const theme = useTheme();
	const colorScheme = useColorScheme();

	return (
		<>
			<Stack.Screen options={{headerShown: false}} />
			<ScrollView style={[styles.container, {backgroundColor: theme.colors.background}]} showsVerticalScrollIndicator={false}>
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

				{/* Hero Section */}
				<View style={styles.heroSection}>
					<ThemeText style={styles.heroTitle}>
						track your manga reading with ease
					</ThemeText>
					<ThemeText style={styles.heroSubtitle}>
						take notes on chapters, save memories, and organize your thoughts across all your favorite manga
					</ThemeText>
					<ThemeButton 
						mode="contained" 
						onPress={() => router.push('/users/register')}
						style={styles.ctaButton}
					>
						get started free
					</ThemeButton>
				</View>

				{/* Value Propositions */}
				<View style={[styles.valueSection, {borderTopColor: theme.colors.surfaceVariant}]}>
					<View style={[styles.valueItem, {borderLeftColor: theme.colors.primary, borderLeftWidth: 3, paddingLeft: 16}]}>
						<ThemeText style={styles.valueNumber}>✍️</ThemeText>
						<ThemeText style={[styles.valueTitle, {color: theme.colors.onBackground}]}>Effortless Note Taking</ThemeText>
						<ThemeText style={[styles.valueText, {color: theme.colors.onSurface}]}>
							Capture your thoughts and reactions instantly while reading
						</ThemeText>
					</View>

					<View style={[styles.divider, {backgroundColor: theme.colors.surfaceVariant}]} />

					<View style={[styles.valueItem, {borderLeftColor: theme.colors.secondary, borderLeftWidth: 3, paddingLeft: 16}]}>
						<ThemeText style={styles.valueNumber}>📸</ThemeText>
						<ThemeText style={[styles.valueTitle, {color: theme.colors.onBackground}]}>Attach Images</ThemeText>
						<ThemeText style={[styles.valueText, {color: theme.colors.onSurface}]}>
							Save memorable panels and artwork you want to remember forever
						</ThemeText>
					</View>

					<View style={[styles.divider, {backgroundColor: theme.colors.surfaceVariant}]} />

					<View style={[styles.valueItem, {borderLeftColor: theme.colors.tertiary, borderLeftWidth: 3, paddingLeft: 16}]}>
						<ThemeText style={styles.valueNumber}>📚</ThemeText>
						<ThemeText style={[styles.valueTitle, {color: theme.colors.onBackground}]}>Organize Everything</ThemeText>
						<ThemeText style={[styles.valueText, {color: theme.colors.onSurface}]}>
							Track chapter ranges and access all your notes in one beautiful place
						</ThemeText>
					</View>
				</View>

				{/* Features Grid */}
				<View style={styles.featuresSection}>
					<ThemeText style={[styles.sectionTitle, {color: theme.colors.onBackground}]}>
						Everything you need
					</ThemeText>

					<View style={styles.featureGrid}>
						<View style={[styles.featureBox, {backgroundColor: theme.colors.surface, borderColor: theme.colors.surfaceVariant}]}>
							<ThemeText style={styles.featureEmoji}>🔖</ThemeText>
							<ThemeText style={[styles.featureName, {color: theme.colors.onBackground}]}>Chapter Tracking</ThemeText>
							<ThemeText style={[styles.featureDesc, {color: theme.colors.onSurface}]}>Mark your reading progress</ThemeText>
						</View>

						<View style={[styles.featureBox, {backgroundColor: theme.colors.surface, borderColor: theme.colors.surfaceVariant}]}>
							<ThemeText style={styles.featureEmoji}>🎨</ThemeText>
							<ThemeText style={[styles.featureName, {color: theme.colors.onBackground}]}>Beautiful Interface</ThemeText>
							<ThemeText style={[styles.featureDesc, {color: theme.colors.onSurface}]}>Designed for reading lovers</ThemeText>
						</View>

						<View style={[styles.featureBox, {backgroundColor: theme.colors.surface, borderColor: theme.colors.surfaceVariant}]}>
							<ThemeText style={styles.featureEmoji}>⚡</ThemeText>
							<ThemeText style={[styles.featureName, {color: theme.colors.onBackground}]}>Lightning Fast</ThemeText>
							<ThemeText style={[styles.featureDesc, {color: theme.colors.onSurface}]}>No delays, just notes</ThemeText>
						</View>

						<View style={[styles.featureBox, {backgroundColor: theme.colors.surface, borderColor: theme.colors.surfaceVariant}]}>
							<ThemeText style={styles.featureEmoji}>🌙</ThemeText>
							<ThemeText style={[styles.featureName, {color: theme.colors.onBackground}]}>Dark Mode</ThemeText>
							<ThemeText style={[styles.featureDesc, {color: theme.colors.onSurface}]}>Easy on your eyes</ThemeText>
						</View>
					</View>
				</View>

				{/* CTA Section */}
				<View style={styles.bottomCTA}>
					<ThemeText style={[styles.bottomTitle, {color: theme.colors.onBackground}]}>
						Ready to start tracking?
					</ThemeText>
					<ThemeButton 
						mode="contained" 
						onPress={() => router.push('/users/register')}
						style={styles.largeCTA}
					>
						start taking notes
					</ThemeButton>
					<ThemeText style={[styles.bottomText, {color: theme.colors.onSurface}]}>
						No credit card required
					</ThemeText>
				</View>

				{/* Footer */}
				<View style={[styles.footer, {borderTopColor: theme.colors.surfaceVariant}]}>
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
		paddingVertical: 60,
		alignItems: "flex-start",
	},
	heroTitle: {
		fontSize: 56,
		fontWeight: "900",
		lineHeight: 64,
		marginBottom: 20,
	},
	heroSubtitle: {
		fontSize: 17,
		lineHeight: 26,
		marginBottom: 40,
		maxWidth: "95%",
	},
	ctaButton: {
		minWidth: 180,
	},
	valueSection: {
		paddingHorizontal: 20,
		paddingVertical: 50,
		borderTopWidth: 1,
	},
	valueItem: {
		marginBottom: 40,
	},
	valueNumber: {
		fontSize: 40,
		marginBottom: 12,
	},
	valueTitle: {
		fontSize: 20,
		fontWeight: "800",
		marginBottom: 8,
	},
	valueText: {
		fontSize: 15,
		lineHeight: 22,
	},
	divider: {
		height: 1,
		marginBottom: 40,
	},
	featuresSection: {
		paddingHorizontal: 20,
		paddingVertical: 50,
	},
	sectionTitle: {
		fontSize: 32,
		fontWeight: "900",
		marginBottom: 36,
	},
	featureGrid: {
		gap: 16,
	},
	featureBox: {
		paddingHorizontal: 16,
		paddingVertical: 20,
		borderRadius: 12,
		borderWidth: 1,
	},
	featureEmoji: {
		fontSize: 28,
		marginBottom: 12,
	},
	featureName: {
		fontSize: 16,
		fontWeight: "700",
		marginBottom: 6,
	},
	featureDesc: {
		fontSize: 13,
		lineHeight: 18,
	},
	bottomCTA: {
		paddingHorizontal: 20,
		paddingVertical: 60,
		alignItems: "center",
	},
	bottomTitle: {
		fontSize: 32,
		fontWeight: "900",
		textAlign: "center",
		marginBottom: 32,
		lineHeight: 40,
	},
	largeCTA: {
		minWidth: 200,
		marginBottom: 20,
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