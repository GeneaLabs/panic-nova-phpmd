# Changelog
## [Upcoming]
- increased performance by using STDIN for linting content, instead of
  linting temp files. This is currently blocked by PHPMD, reference
  https://github.com/phpmd/phpmd/issues/882.

## [Known Issues]

## [0.1.13] - 2021-04-26
### Updated
- PHPMD linter to version 2.10.0, which now works with PHP 8. PHPMD s

## [0.1.12] - 2021-04-13
### Added
- executable path option.

## [0.1.11] - 2021-04-06
### Added
- handling of non-json output messages from PHPMD.

## [0.1.10] - 2021-04-06
### Fixed
- handling of error lints when no errors were present.

## [0.1.9] - 2021-04-05
### Added
- display of parsing errors to the document.

## [0.1.8] - 2021-04-05
### Fixed
- comingling of lint results between files.

## [0.1.7] - 2021-04-05
### Fixed
- comingling of lint results between files.

## [0.1.6] - 2021-04-04
### Fixed
- linting process to use temporary files, instead of `stdin` as there are issues
  with the linter's upstream dependencies in connection with `stdin`.
- linting results to underline entire row, as it is difficult to find the exact
  corresponding code based on JSON results. Will investigate other options down
  the road.

## [0.1.5] - 2021-04-04
### Added
- license details.

### Updated
- linting process to use `stdin` instead of relying on a file, which greatly
  improves performance.

## [0.1.4] - 2021-04-03
### Added
- linter process cancelation, in the event that a new linter was started before
  the previous one finished.
- temporary file storage to lint in-buffer documents.
- configuration option to show debug logs (and conversely hide debug logs if not
  enabled).
- improved logging with more details.

## [0.1.3] - 2021-04-03
### Fixed
- underlining of offending piece of code specifically, instead of entire line.

## [0.1.2] - 2021-03-31
### Fixed
- executable permissions for PHPMD.

## [0.1.1] - 2021-03-30
### Fixed
- executable permissions for PHPMD.

## [0.1.0] - 2021-03-30
### Implemented
- initial functionality.
