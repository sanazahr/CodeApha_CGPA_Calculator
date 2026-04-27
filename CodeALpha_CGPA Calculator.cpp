#include <iostream>
#include <iomanip>
#include <string>
#include <windows.h>
using namespace std;

// Function to change text color
void SetColor(int foreground, int background) 
{
    HANDLE hConsole = GetStdHandle(STD_OUTPUT_HANDLE);
    SetConsoleTextAttribute(hConsole, (WORD)((background << 4) | foreground));
}

// Function to validate grade input
bool isValidGrade(const string& grade)
{
    string validGrades[] = { "A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "F" };
    for (const string& validGrade : validGrades) 
    {
        if (grade == validGrade)
        {
            return true;
        }
    }
    return false;
}

// Function to validate credit input
bool isValidCredit(int creditHours)
{
    return (creditHours > 0 && creditHours <= 5); 
}

// Function to calculate grade points
double getGradePoints(const string& grade) 
{
    if (grade == "A+")
        return 4.0;
    if (grade == "A") 
        return 4.0;
    if (grade == "A-") 
        return 3.7;
    if (grade == "B+")
        return 3.3;
    if (grade == "B")
        return 3.0;
    if (grade == "B-") 
        return 2.7;
    if (grade == "C+")
        return 2.3;
    if (grade == "C") 
        return 2.0;
    if (grade == "C-") 
        return 1.7;
    if (grade == "D+")
        return 1.3;
    if (grade == "D")
        return 1.0;
    if (grade == "F") 
        return 0.0;
    return -1;
}

int main() 
{
    SetColor(5, 0);
    cout << " __  __  __        __          __            _____  __  " << endl;
    cout << "/  `/ _`|__)/\\    /  ` /\\ |   /  `|  ||    /\\ |/  \\|__)" << endl;
    cout << "\\__,\\__||  /~~\\   \\__,/~~\\|___\\__,\\__/|___/~~\\|\\__/|  \\" << endl;
    cout << "" << endl;


    int numCourses;
    string courseNames[100];
    string grades[100];
    int credits[100];
    int totalCredits = 0;
    double totalGradePoints = 0.0;

    // Input: Number of courses
    while (true) 
    {
        SetColor(13, 7);
        cout << "Enter the number of courses:";
        SetColor(7, 0);
        cout << " ";
        cin >> numCourses;
        if (cin.fail() || numCourses <= 0)
        {
            cout << "Invalid input! Please enter a positive integer." << endl;
            cin.clear(); 
            cin.ignore(10000, '\n'); 
        }
        else 
        {
            break;
        }
    }

    // Input: Course names, grades and credits
    for (int i = 0; i < numCourses; ++i)
    {
        cout << "\nEnter details for course " << i + 1 << ":" << endl;

        // Input: Course name
        cout << "Enter course name: ";
        cin.ignore(); 
        getline(cin, courseNames[i]);

        // Input: Grade
        while (true) 
        {
            cout << "Enter grade: ";
            cin >> grades[i];
            if (isValidGrade(grades[i])) 
            {
                break;
            }
            else 
            {
                cout << "Invalid grade! Please enter a valid grade." << endl;
                cin.clear();
                cin.ignore(10000, '\n');
            }
        }

        // Input: Credit hours
        while (true)
        {
            cout << "Enter credit hour: ";
            cin >> credits[i];
            if (cin.fail() || !isValidCredit(credits[i])) 
            {
                cout << "Invalid credit! Please enter a valid credit (1-5)." << endl;
                cin.clear();
                cin.ignore(10000, '\n');
            }
            else
            {
                break;
            }
        }
    }

    // Calculate total credits and total grade points
    for (int i = 0; i < numCourses; ++i) 
    {
        totalCredits += credits[i];
        totalGradePoints += getGradePoints(grades[i]) * credits[i];
    }

    // Calculate CGPA
    double cgpa = totalGradePoints / totalCredits;

    // Output: Display results
    cout << endl;
    SetColor(13, 7);
    cout << setw(20) << left << "Course Name: " << setw(20) << "Grade:" << setw(20) << "Credit:" << endl;
    SetColor(7, 0);
    for (int i = 0; i < numCourses; ++i)
    {
        cout << setw(20) << left << courseNames[i] << setw(20) << grades[i] << setw(20) << credits[i] << endl;
    }
    cout << endl;
    cout << "Total Credit Hours: ";
    cout << totalCredits << endl;
    cout << "Total Grade Points: ";
    cout << totalGradePoints << endl << endl;
    SetColor(13, 7);  cout << "CGPA:";
    SetColor(7, 0); cout << " " << cgpa << endl;

    return 0;
}