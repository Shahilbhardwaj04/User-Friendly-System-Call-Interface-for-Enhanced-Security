import java.io.File;
import java.text.SimpleDateFormat;
import java.util.*;

public class SecureSystemCallInterface {

    private static final int MAX_LOGIN_ATTEMPTS = 3;
    private static final int OTP_EXPIRY_SECONDS = 60;
    private static Map<String, String> userDatabase = new HashMap<>();
    private static Map<String, String> userRoles = new HashMap<>();
    private static Map<String, Integer> loginAttempts = new HashMap<>();
    private static List<String> systemCallLogs = new ArrayList<>();
    private static Random random = new Random();
    private static Map<String, Integer> generatedOtps = new HashMap<>();
    private static Map<String, Long> otpTimestamps = new HashMap<>();

    static {
        userDatabase.put("admin", "password123");
        userDatabase.put("user1", "pass1");
        userDatabase.put("user2", "securePass2");
        userDatabase.put("guest", "guest123");

        userRoles.put("admin", "ADMIN");
        userRoles.put("user1", "USER");
        userRoles.put("user2", "USER");
        userRoles.put("guest", "GUEST");
    }

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        while (true) {
            String username = login(scanner);
            if (username == null) {
                System.out.println("\033[31mToo many failed attempts. Exiting...\033[0m");
                break;
            }

            String role = userRoles.get(username);
            runMenu(username, role, scanner);
        }
        scanner.close();
    }

    private static String login(Scanner scanner) {
        String username, password;
        int attempts = 0;

        System.out.print("\033[34mEnter Username: \033[0m");
        username = scanner.nextLine();

        loginAttempts.putIfAbsent(username, 0);

        while (attempts < MAX_LOGIN_ATTEMPTS) {
            System.out.print("\033[34mEnter Password: \033[0m");
            password = scanner.nextLine();

            if (authenticateUser(username, password)) {
                System.out.println("\033[32mPassword Verified. Generating OTP...\033[0m");
                int otp = generateOtp(username);
                System.out.println("\033[33mYour OTP is: " + otp + " (Valid for 60 seconds)\033[0m");

                System.out.print("\033[34mEnter OTP: \033[0m");
                int userOtp = scanner.nextInt();
                scanner.nextLine();

                if (validateOtp(username, userOtp)) {
                    System.out.println("\033[32mAuthentication Successful! Role: " + userRoles.get(username) + "\033[0m");
                    logSystemCall(username, "Login Successful");
                    return username;
                } else {
                    System.out.println("\033[31mInvalid or Expired OTP. Try again.\033[0m");
                    return null;
                }
            } else {
                attempts++;
                loginAttempts.put(username, attempts);
                System.out.println("\033[31mAuthentication Failed. (" + (MAX_LOGIN_ATTEMPTS - attempts) + " attempts left)\033[0m");
                logSystemCall(username, "Failed Login Attempt");
            }
        }
        return null;
    }

    private static boolean authenticateUser(String username, String password) {
        System.out.println("\n\033[36m--- System Call Usage Statistics ---\033[0m");
        return userDatabase.containsKey(username) && userDatabase.get(username).equals(password);
    }

    private static int generateOtp(String username) {
        int otp = 100000 + random.nextInt(900000);
        generatedOtps.put(username, otp);
        otpTimestamps.put(username, System.currentTimeMillis());
        return otp;
    }

    private static boolean validateOtp(String username, int userOtp) {
        if (!generatedOtps.containsKey(username)) return false;

        int validOtp = generatedOtps.get(username);
        long timestamp = otpTimestamps.get(username);
        long currentTime = System.currentTimeMillis();

        if (currentTime - timestamp > OTP_EXPIRY_SECONDS * 1000) {
            generatedOtps.remove(username);
            return false;
        }

        return validOtp == userOtp;
    }

    private static void runMenu(String username, String role, Scanner scanner) {
        while (true) {
            System.out.println("\n\033[36m1. Check Disk Space");
            System.out.println("2. View Logs");

            if (!role.equals("GUEST")) {
                System.out.println("3. Show Usage Stats");
            }

            System.out.println("4. Logout & Switch User");
            System.out.println("5. Logout & Exit\033[0m");
            System.out.print("\033[34mEnter your choice: \033[0m");

            int choice = scanner.nextInt();
            scanner.nextLine();

            if (choice == 1) {
                checkDiskSpace(username);
            } else if (choice == 2) {
                if (role.equals("GUEST")) {
                    System.out.println("\033[31mAccess Denied: Guests cannot view logs.\033[0m");
                } else {
                    viewLogs();
                }
            } else if (choice == 3) {
                if (role.equals("ADMIN")) {
                    showUsageStats();
                } else {
                    System.out.println("\033[31mAccess Denied: Only Admins can view usage stats.\033[0m");
                }
            } else if (choice == 4) {
                System.out.println("\033[33mLogging out...\033[0m\n");
                logSystemCall(username, "Logged out");
                return;
            } else if (choice == 5) {
                System.out.println("\033[33mLogging out and exiting...\033[0m");
                logSystemCall(username, "Logged out and exited");
                System.exit(0);
            } else {
                System.out.println("\033[31mInvalid choice. Try again.\033[0m");
            }
        }
    }

    private static void checkDiskSpace(String username) {
        File root = new File("/");
        long totalSpace = root.getTotalSpace();
        long freeSpace = root.getFreeSpace();
        long usedSpace = totalSpace - freeSpace;

        System.out.println("\n\033[36m--- Disk Space Details ---\033[0m");
        System.out.printf("Total Space : %.2f GB\n", totalSpace / 1e9);
        System.out.printf("Used Space  : %.2f GB\n", usedSpace / 1e9);
        System.out.printf("Free Space  : %.2f GB\n", freeSpace / 1e9);
        System.out.println("\033[36m---------------------------\033[0m");

        logSystemCall(username, "Checked Disk Space");
    }

    private static void logSystemCall(String username, String action) {
        String timestamp = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date());
        String logEntry = String.format("[%s] User: %-10s | Action: %s", timestamp, username, action);
        systemCallLogs.add(logEntry);
    }

    private static void viewLogs() {
        System.out.println("\n\033[36m--- System Call Logs ---\033[0m");
        for (String log : systemCallLogs) {
            System.out.println(log);
        }
        System.out.println("\033[36m---------------------------\033[0m");
    }

    private static void showUsageStats() {
        System.out.println("\n\033[36m--- System Call Usage Statistics ---\033[0m");
    }
}
