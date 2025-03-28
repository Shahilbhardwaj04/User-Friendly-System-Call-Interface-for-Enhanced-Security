import java.util.*;

public class SecureSystemCallInterface {

    private static Map<String, String> userDatabase = new HashMap<>();
    private static List<String> systemCallLogs = new ArrayList<>();

    static {
        // Initialize with some users
        userDatabase.put("admin", "password123");
        userDatabase.put("user1", "pass1");
        userDatabase.put("user2", "securePass2");
        userDatabase.put("guest", "guest123");
    }

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);

        System.out.println("--- Secure System Call Interface ---");

        System.out.print("Enter Username: ");
        String username = scanner.nextLine();

        System.out.print("Enter Password: ");
        String password = scanner.nextLine();

        if (authenticateUser(username, password)) {
            System.out.println("Authentication Successful!");
            System.out.println("1. Perform System Call\n2. View Logs\n3. Exit");

            while (true) {
                System.out.print("Enter your choice: ");
                int choice = scanner.nextInt();
                scanner.nextLine(); // Consume newline

                if (choice == 1) {
                    performSystemCall(username);
                } else if (choice == 2) {
                    viewLogs();
                } else if (choice == 3) {
                    System.out.println("Exiting...");
                    break;
                } else {
                    System.out.println("Invalid choice. Try again.");
                }
            }
        } else {
            System.out.println("Authentication Failed. Access Denied.");
        }

        scanner.close();
    }

    private static boolean authenticateUser(String username, String password) {
        return userDatabase.containsKey(username) && userDatabase.get(username).equals(password);
    }

    private static void performSystemCall(String username) {
        // Example system call
        String systemCall = "Checked Disk Space";
        logSystemCall(username, systemCall);
        System.out.println("System Call Performed: " + systemCall);
    }

    private static void logSystemCall(String username, String action) {
        String logEntry = "User: " + username + " | Action: " + action + " | Timestamp: " + new Date().toString();
        systemCallLogs.add(logEntry);
    }

    private static void viewLogs() {
        System.out.println("--- System Call Logs ---");
        for (String log : systemCallLogs) {
            System.out.println(log);
        }
    }
}
