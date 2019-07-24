# THIS IS A SOURCE FOR THE scripts/ DIRECTORY

# Print an info message to stdout
info_msg() {
    printf "\x1b[38;5;14m"
    printf "\n[INFO] $1\n\n"
    printf "\x1b[0m"
}

# Print an error message to stdout (not stderr)
err_msg() {
    printf "\x1b[31;1m"
    printf "\n[ERROR] $1\n\n"
    printf "\x1b[0m"
}
