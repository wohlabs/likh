import { View, ScrollView, StyleSheet, Pressable } from "react-native";
import { Stack, router } from "expo-router";
import ThemeText from "@/components/ThemeText";
import ThemeButton from "@/components/ThemeButton";

export default function LandingPage() {
	return (
		<>
			<Stack.Screen options={{headerShown: false}} />
			<ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
				{/* Header */}
				<View style={styles.header}>
					<ThemeText style={styles.logo}>likh</ThemeText>
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
				<View style={styles.valueSection}>
					<View style={styles.valueItem}>
						<ThemeText style={styles.valueNumber}>✍️</ThemeText>
						<ThemeText style={styles.valueTitle}>effortless note taking</ThemeText>
						<ThemeText style={styles.valueText}>
							capture thoughts and reactions instantly while reading
						</ThemeText>
					</View>

					<View style={styles.divider} />

					<View style={styles.valueItem}>
						<ThemeText style={styles.valueNumber}>📸</ThemeText>
						<ThemeText style={styles.valueTitle}>attach images</ThemeText>
						<ThemeText style={styles.valueText}>
							save memorable panels and artwork you want to remember
						</ThemeText>
					</View>

					<View style={styles.divider} />

					<View style={styles.valueItem}>
						<ThemeText style={styles.valueNumber}>📚</ThemeText>
						<ThemeText style={styles.valueTitle}>organize everything</ThemeText>
						<ThemeText style={styles.valueText}>
							track chapter ranges and access all your notes in one place
						</ThemeText>
					</View>
				</View>

				{/* Features Grid */}
				<View style={styles.featuresSection}>
					<ThemeText style={styles.sectionTitle}>
						everything you need
					</ThemeText>

					<View style={styles.featureGrid}>
						<View style={styles.featureBox}>
							<ThemeText style={styles.featureEmoji}>🔖</ThemeText>
							<ThemeText style={styles.featureName}>chapter tracking</ThemeText>
							<ThemeText style={styles.featureDesc}>mark your reading progress</ThemeText>
						</View>

						<View style={styles.featureBox}>
							<ThemeText style={styles.featureEmoji}>🎨</ThemeText>
							<ThemeText style={styles.featureName}>beautiful interface</ThemeText>
							<ThemeText style={styles.featureDesc}>designed for reading lovers</ThemeText>
						</View>

						<View style={styles.featureBox}>
							<ThemeText style={styles.featureEmoji}>⚡</ThemeText>
							<ThemeText style={styles.featureName}>lightning fast</ThemeText>
							<ThemeText style={styles.featureDesc}>no delays, just notes</ThemeText>
						</View>

						<View style={styles.featureBox}>
							<ThemeText style={styles.featureEmoji}>🌙</ThemeText>
							<ThemeText style={styles.featureName}>dark mode</ThemeText>
							<ThemeText style={styles.featureDesc}>easy on your eyes</ThemeText>
						</View>
					</View>
				</View>

				{/* CTA Section */}
				<View style={styles.bottomCTA}>
					<ThemeText style={styles.bottomTitle}>
						ready to take control of your reading?
					</ThemeText>
					<ThemeButton 
						mode="contained" 
						onPress={() => router.push('/users/register')}
						style={styles.largeCTA}
					>
						start taking notes
					</ThemeButton>
					<ThemeText style={styles.bottomText}>
						no credit card required
					</ThemeText>
				</View>

				{/* Footer */}
				<View style={styles.footer}>
					<ThemeText style={styles.footerText}>
						© 2025 likh. built with love for manga readers.
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
		opacity: 0.7,
		maxWidth: "95%",
	},
	ctaButton: {
		minWidth: 180,
	},
	valueSection: {
		paddingHorizontal: 20,
		paddingVertical: 50,
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
		opacity: 0.7,
	},
	divider: {
		height: 1,
		backgroundColor: "#f0f0f0",
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
		borderColor: "#f0f0f0",
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
		opacity: 0.6,
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
		opacity: 0.6,
		fontWeight: "500",
	},
	footer: {
		paddingHorizontal: 20,
		paddingVertical: 30,
		alignItems: "center",
		borderTopWidth: 1,
		borderTopColor: "#f0f0f0",
		marginBottom: 20,
	},
	footerText: {
		fontSize: 12,
		opacity: 0.5,
		fontWeight: "500",
	},
});