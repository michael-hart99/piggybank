'''
'''
import os
import pickle
import subprocess

from google.auth.transport.requests import Request
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

# If modifying these scopes, delete the file token.pickle.
SCOPES = ['https://www.googleapis.com/auth/drive.file']
TOKEN_FILE = '.token.pickle'

BUILD_DIR = 'build'
DEV_DIR = 'dev'

BASE_FOLDER_NAME = 'Piggybank'
SHEET_FOLDER_NAME = 'Data & Reports'
FORM_FOLDER_NAME = 'Forms'
BACKUP_FOLDER_NAME = 'Backups'

def auth():
    '''
    '''
    creds = None
    # The token file stores the user's access and refresh tokens, and is
    # created automatically when the authorization flow completes for the first
    # time.
    if os.path.exists(TOKEN_FILE):
        with open(TOKEN_FILE, 'rb') as token:
            creds = pickle.load(token)
    # If there are no (valid) credentials available, let the user log in.
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                'credentials.json', SCOPES)
            creds = flow.run_local_server()
        # Save the credentials for the next run
        with open(TOKEN_FILE, 'wb') as token:
            pickle.dump(creds, token)

    return creds

def init_file(service, id_file, title, folder):
    '''
    service = authorized Google Drive API Resource
    dir = <string>
    title = <string>
    doctype = <DocType>
    '''
    file_metadata = {'name': title,
                     'mimeType': folder['mime'],
                     'parents': [folder['id']]}
    file_id = service.files().create(body=file_metadata,
                                     fields='id').execute().get('id')

    base_dir = os.getcwd()
    id_file = open(base_dir + '/' + DEV_DIR + '/' + id_file, "w")
    id_file.write("export const ID = '" + file_id + "';")
    id_file.close()

def main():
    '''
    '''
    #pylint: disable=E1101
    base_dir = os.getcwd()

    group_name = input("Group Name: ")
    cur_quarter = input("\n0 = Winter\n1 = Spring\n2 = Summer\n3 = Fall\nCurrent Quarter: ")
    cur_year = input("\nCurrent Year: ")
    mem_dues = input("\nMember Dues: ")
    officer_dues = input("Officer Dues: ")
    num_attns = input("\nNumber of attendances before members owe dues: ")
    project_info_file = open(base_dir + '/' + DEV_DIR + '/' + 'projectInfo.ts', "w")
    project_info_file.write("export const GROUP_NAME: string = '" + group_name + "';\n" +
                            "export const START_QUARTER: string = '" + cur_quarter + "';\n" +
                            "export const START_YEAR: string = '" + cur_year + "';\n" +
                            "export const MEMBER_DUES: string = '" + mem_dues + "';\n" +
                            "export const OFFICER_DUES: string = '" + officer_dues + "';\n" +
                            "export const NUM_ATTNS: string = '" + num_attns + "';")
    project_info_file.close()

    print('\nTwo browser windows should now open. Please authorize this script to continue creating folders and files in your drive.')
    subprocess.run('clasp login', shell=True)

    creds = auth()
    drive_service = build('drive', 'v3', credentials=creds)

    print('\n Creating folders...')
    # Create base folder
    file_metadata = {'name': BASE_FOLDER_NAME,
                     'mimeType': 'application/vnd.google-apps.folder'}
    base_folder_id = drive_service.files() \
                                  .create(body=file_metadata, fields='id') \
                                  .execute().get('id')

    sheet_folder = {'name': SHEET_FOLDER_NAME,
                    'id': '',
                    'mime': 'application/vnd.google-apps.spreadsheet'}
    form_folder = {'name': FORM_FOLDER_NAME,
                   'id': '',
                   'mime': 'application/vnd.google-apps.form'}

    # Create sub folders
    file_metadata = {'name': sheet_folder['name'],
                     'mimeType': 'application/vnd.google-apps.folder',
                     'parents': [base_folder_id]}
    sheet_folder['id'] = drive_service.files() \
                                      .create(body=file_metadata, fields='id') \
                                      .execute().get('id')

    file_metadata = {'name': form_folder['name'],
                     'mimeType': 'application/vnd.google-apps.folder',
                     'parents': [base_folder_id]}
    form_folder['id'] = drive_service.files() \
                                     .create(body=file_metadata, fields='id') \
                                     .execute().get('id')

    # Sheets
    print('\n Creating sheets...')
    init_file(drive_service, 'ids/tablesId.ts', 'Database', sheet_folder)
    init_file(drive_service, 'ids/viewsId.ts', 'Generated Report', sheet_folder)

    # Forms
    print('\n Creating forms...')
    init_file(drive_service, 'ids/ae.ts', 'Add Expense', form_folder)
    init_file(drive_service, 'ids/ai.ts', 'Add Income', form_folder)
    init_file(drive_service, 'ids/ami.ts', 'Add Member IOU', form_folder)
    init_file(drive_service, 'ids/cd.ts', 'Collect Dues', form_folder)
    init_file(drive_service, 'ids/ct.ts', 'Confirm Transfer', form_folder)
    init_file(drive_service, 'ids/nq.ts', 'Next Quarter', form_folder)
    init_file(drive_service, 'ids/rmi.ts', 'Resolve Member IOU', form_folder)
    init_file(drive_service, 'ids/ta.ts', 'Take Attendance', form_folder)
    init_file(drive_service, 'ids/tf.ts', 'Transfer Funds', form_folder)
    init_file(drive_service, 'ids/ucs.ts', 'Update Contact Settings', form_folder)
    init_file(drive_service, 'ids/ums.ts', 'Update Member Status', form_folder)

    # Backup Folder
    file_metadata = {'name': BACKUP_FOLDER_NAME,
                     'mimeType': 'application/vnd.google-apps.folder',
                     'parents': [base_folder_id]}
    backup_folder_id = drive_service.files() \
                                    .create(body=file_metadata, fields='id') \
                                    .execute().get('id')

    id_file = open(base_dir + '/' + DEV_DIR + '/' + 'ids/backupFolderId.ts', "w")
    id_file.write("export const ID = '" + backup_folder_id + "';")
    id_file.close()

    print('\n Initializing Google Apps Script...')
    base_dir = os.getcwd()
    os.chdir(base_dir + '/' + BUILD_DIR)
    subprocess.run('clasp create --type standalone --title "Piggybank"', shell=True)
    os.chdir(base_dir)

    subprocess.run('npm run deploy', shell=True)

    os.chdir(base_dir + '/' + BUILD_DIR)
    subprocess.run('clasp open', shell=True)
    os.chdir(base_dir)

if __name__ == '__main__':
    main()
