# Implementation Plan

- [x] 1. Set up project structure and development environment


  - Create root directory structure (contracts/, frontend/, scripts/)
  - Initialize package.json for Hardhat dependencies
  - Configure Hardhat with Sepolia network settings
  - Create .env file template for private keys and RPC URLs
  - _Requirements: 2.1, 2.2_

- [x] 2. Implement smart contract with Merkle verification

  - [x] 2.1 Create VotingWithMerkle.sol contract

    - Write contract with state variables (merkleRoot, admin, candidateCount, votes mapping, nullifierUsed mapping)
    - Implement constructor to initialize root and candidate count
    - Add admin modifier for access control
    - _Requirements: 2.2, 2.3, 3.3, 3.6_
  - [x] 2.2 Implement updateRoot function

    - Write admin-only function to update Merkle root
    - Emit RootUpdated event with timestamp
    - Add input validation
    - _Requirements: 3.2, 3.3_
  - [x] 2.3 Implement vote function with Merkle proof verification

    - Write vote function accepting candidateId, nullifierHash, leaf, and proof array
    - Implement Merkle proof verification loop with sorted pair hashing
    - Add nullifier check for double-vote prevention
    - Increment vote count and emit VoteCast event
    - _Requirements: 2.3, 3.4, 3.5, 3.6, 5.1, 5.2, 5.3, 5.4, 5.5_
  - [x] 2.4 Add view functions and events

    - Implement getVotes function to query candidate vote counts
    - Define RootUpdated and VoteCast events
    - Add helper functions for contract state queries
    - _Requirements: 2.7, 6.2_

- [ ] 3. Write smart contract tests
  - [ ] 3.1 Set up Hardhat testing environment
    - Configure test network and accounts
    - Create test fixtures for contract deployment
    - Write helper functions for Merkle tree generation in tests
    - _Requirements: 2.2_
  - [ ] 3.2 Write tests for root update functionality
    - Test admin can update root
    - Test non-admin cannot update root
    - Test event emission on root update
    - _Requirements: 3.3, 9.3_
  - [ ] 3.3 Write tests for voting with valid proofs
    - Test successful vote with valid Merkle proof
    - Test vote count increments correctly
    - Test VoteCast event emission
    - _Requirements: 3.5, 3.6, 5.4, 5.5_
  - [ ] 3.4 Write tests for double-vote prevention
    - Test voting twice with same nullifier fails
    - Test nullifierUsed mapping updates correctly
    - Test error message for already voted
    - _Requirements: 5.1, 5.2, 5.3_
  - [ ] 3.5 Write tests for invalid proof rejection
    - Test vote with invalid proof reverts
    - Test vote with wrong leaf reverts
    - Test vote with mismatched root reverts
    - _Requirements: 3.6, 3.7_


- [ ] 4. Deploy smart contract to Sepolia testnet
  - [x] 4.1 Create deployment script

    - Write Hardhat deployment script for VotingWithMerkle contract
    - Set initial Merkle root (zero hash for empty tree)
    - Set candidate count to 5
    - Log deployed contract address
    - _Requirements: 2.1, 2.2_
  - [x] 4.2 Configure Sepolia network in Hardhat

    - Add Sepolia RPC URL to hardhat.config.js
    - Configure deployer account with private key from .env
    - Set gas price and gas limit settings
    - _Requirements: 2.1, 2.2_
  - [ ] 4.3 Deploy and verify contract
    - Run deployment script on Sepolia
    - Save contract address and ABI to frontend config
    - Verify contract on Etherscan (optional)
    - _Requirements: 2.2, 2.6_

- [-] 5. Create frontend HTML structure

  - [x] 5.1 Create index.html with authentication page

    - Build HTML structure with header, main content area, and footer
    - Add prominent "Scan Voter ID" button (simulates scanning voter ID card or fingerprint)
    - Include status indicators and error message containers
    - Add navigation to voting page after successful scan
    - _Requirements: 1.1, 1.4, 7.1, 7.6_
  - [x] 5.2 Create voting.html with candidate selection interface

    - Build grid layout for 5 candidate cards
    - Add candidate card structure (image, name, party, description)
    - Create confirmation dialog modal
    - Add transaction status display area
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 7.1_
  - [x] 5.3 Create dashboard.html for vote results

    - Build layout for vote statistics display
    - Add containers for charts (bar and donut)
    - Create blockchain status indicator
    - Add Etherscan link section
    - _Requirements: 6.1, 6.2, 6.4, 6.5, 6.7_
  - [ ] 5.4 Create admin.html for admin control panel
    - Build admin authentication form
    - Add candidate management interface
    - Create Merkle root update form
    - Add system monitoring dashboard
    - _Requirements: 9.1, 9.2, 9.3, 9.5_
  - [x] 5.5 Create receipt.html for vote verification


    - Build receipt display layout
    - Add QR code container
    - Create verification lookup form
    - Add Etherscan transaction link
    - _Requirements: 8.1, 8.2, 8.3, 8.4_


- [ ] 6. Implement CSS styling with glassmorphism design
  - [x] 6.1 Create styles.css with design system variables

    - Define CSS custom properties for colors, spacing, typography
    - Set up color palette (primary, secondary, success, error, backgrounds)
    - Define typography scale and font families
    - Create spacing system based on 4px grid
    - _Requirements: 7.3, 7.4, 11.1_
  - [x] 6.2 Style authentication page components

    - Apply glassmorphism effect to card containers
    - Style buttons with hover and active states
    - Create input field styles with focus states
    - Add animations for transitions
    - _Requirements: 7.1, 7.2, 7.3_
  - [x] 6.3 Style candidate cards with hover effects

    - Create card layout with image, text, and button
    - Add hover scale and shadow effects
    - Style selected state with border and background
    - Implement responsive grid layout
    - _Requirements: 4.2, 7.1, 11.1, 11.2_
  - [x] 6.4 Style dashboard charts and statistics

    - Create chart container styles
    - Style statistics cards with glassmorphism
    - Add color coding for vote percentages
    - Implement responsive layout for mobile
    - _Requirements: 6.5, 7.1, 11.1_
  - [ ] 6.5 Implement dark and light mode styles
    - Create CSS classes for dark and light themes
    - Add theme toggle button
    - Store theme preference in localStorage
    - Ensure WCAG AA contrast compliance
    - _Requirements: 7.3, 7.4_
  - [x] 6.6 Add responsive breakpoints and mobile styles

    - Implement media queries for mobile (< 640px)
    - Add tablet styles (640px - 1024px)
    - Optimize desktop layout (> 1024px)
    - Ensure touch targets are minimum 44px
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [ ] 7. Implement authentication module JavaScript
  - [x] 7.1 Create auth.js with mock scan button functionality

    - Write generateMockVoterData function that creates random voter ID when scan button is clicked
    - Implement createVoterHash function using keccak256(mockVoterID + timestamp + random salt)
    - Add visual feedback (animation/loading) when scan button is clicked
    - Store voter hash in sessionStorage after successful scan
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 10.1_
  - [x] 7.2 Add voter eligibility check

    - Write checkVoterEligibility function to query blockchain
    - Check if nullifier hash exists in contract
    - Display error if voter already voted
    - Redirect to voting page if eligible
    - _Requirements: 1.5, 1.6, 1.7, 5.6_


- [ ] 8. Implement Merkle trie manager JavaScript
  - [x] 8.1 Create merkle.js with tree construction

    - Write addVoter function to add leaf to tree
    - Implement computeRoot function using merkletreejs library
    - Use sorted pair hashing for deterministic tree
    - Store tree data in localStorage or memory
    - _Requirements: 3.1, 3.2_
  - [x] 8.2 Implement proof generation

    - Write generateProof function for given voter hash
    - Return proof array of sibling hashes
    - Handle edge cases (empty tree, single leaf)
    - Validate proof format before returning
    - _Requirements: 3.4, 3.5_
  - [x] 8.3 Add local proof verification

    - Write verifyProof function for client-side validation
    - Implement same verification logic as smart contract
    - Test proof before blockchain submission
    - Log verification results for debugging
    - _Requirements: 3.5, 3.6_
  - [x] 8.4 Create demo tree builder for testing

    - Write buildDemoTree function with sample voters
    - Generate multiple test voter hashes
    - Compute and display demo Merkle root
    - Allow adding current voter to demo tree
    - _Requirements: 3.1, 3.2_

- [ ] 9. Implement Web3 integration layer
  - [x] 9.1 Create web3.js with MetaMask connection

    - Write connectWallet function to request MetaMask access
    - Check if MetaMask is installed
    - Verify network is Sepolia (chain ID 11155111)
    - Handle account and network change events
    - _Requirements: 2.1, 2.4_
  - [x] 9.2 Implement contract interface

    - Write getContract function returning ethers.js contract instance
    - Load contract ABI from config file
    - Use deployed contract address from config
    - Set up contract with signer for transactions
    - _Requirements: 2.2, 2.3_
  - [x] 9.3 Create transaction management functions

    - Write sendTransaction function for contract calls
    - Estimate gas before submission
    - Handle transaction confirmation
    - Monitor transaction status with polling
    - _Requirements: 2.3, 2.5, 2.6, 4.6_
  - [ ] 9.4 Implement event listening
    - Write listenToEvents function for contract events
    - Subscribe to VoteCast and RootUpdated events
    - Update UI when events are received
    - Handle event filtering and pagination
    - _Requirements: 2.7, 6.3_


- [ ] 10. Implement voting interface JavaScript
  - [x] 10.1 Create voting.js with hardcoded candidate data

    - Define 5 candidates directly in code (Candidate A through E with party and symbol)
    - Write renderCandidates function to display candidate cards
    - Add click handlers for candidate selection
    - Display candidate information clearly
    - _Requirements: 4.1, 4.2_
  - [x] 10.2 Implement candidate selection logic

    - Write selectCandidate function to handle clicks
    - Highlight selected candidate card
    - Show confirmation dialog with candidate details
    - Allow deselection and reselection
    - _Requirements: 4.3, 4.4_
  - [x] 10.3 Create vote submission function

    - Write submitVote function to initiate blockchain transaction
    - Generate nullifier hash from voter hash
    - Get Merkle proof for voter
    - Call contract vote function with proof
    - _Requirements: 4.5, 5.4, 5.5_
  - [x] 10.4 Add transaction status tracking

    - Display loading spinner during transaction
    - Show transaction hash when submitted
    - Poll for transaction confirmation
    - Display success message with receipt link
    - _Requirements: 4.6, 4.7, 5.7_
  - [x] 10.5 Implement error handling for voting

    - Handle MetaMask rejection
    - Display user-friendly error messages
    - Handle contract revert errors (already voted, invalid proof)
    - Provide retry option for network failures
    - _Requirements: 7.6_

- [ ] 11. Implement dashboard JavaScript
  - [x] 11.1 Create dashboard.js with vote fetching

    - Write fetchVoteCounts function to read from contract
    - Query vote count for each candidate (1-5)
    - Calculate total votes and percentages
    - Handle zero votes gracefully
    - _Requirements: 6.1, 6.2_
  - [x] 11.2 Implement chart rendering

    - Write renderCharts function using Chart.js
    - Create bar chart for vote counts
    - Create donut chart for vote percentages
    - Apply color coding to charts
    - _Requirements: 6.5_
  - [x] 11.3 Add auto-refresh functionality

    - Write pollForUpdates function with 30-second interval
    - Fetch latest vote counts periodically
    - Update charts and statistics without page reload
    - Display last update timestamp
    - _Requirements: 6.3_
  - [x] 11.4 Create Etherscan integration

    - Write function to generate Etherscan links
    - Add links for contract address and transactions
    - Display blockchain status indicator
    - Show current block number
    - _Requirements: 6.6_


- [ ] 12. Implement receipt and verification system
  - [ ] 12.1 Create receipt.js with receipt generation
    - Write generateReceipt function to create vote receipt
    - Include transaction hash, timestamp, and candidate ID
    - Generate QR code with transaction data
    - Store receipt data in sessionStorage
    - _Requirements: 8.1, 8.2_
  - [ ] 12.2 Implement vote verification lookup
    - Write verifyVote function to check vote status
    - Accept voter hash as input
    - Query blockchain for nullifier existence
    - Display confirmation without revealing candidate choice
    - _Requirements: 8.3, 8.4, 8.5_
  - [ ] 12.3 Add receipt download functionality
    - Write downloadReceipt function to export as PDF or image
    - Format receipt with all transaction details
    - Include Merkle proof path for transparency
    - Add print option
    - _Requirements: 8.6, 8.7_

- [ ] 13. Implement admin control panel
  - [ ] 13.1 Create admin.js with authentication
    - Write authenticateAdmin function with password check
    - Store admin session in sessionStorage
    - Protect admin routes with authentication check
    - Add logout functionality
    - _Requirements: 9.1_
  - [ ] 13.2 Implement basic candidate display in admin panel
    - Display the 5 hardcoded candidates in admin view
    - Show current vote counts for each candidate
    - Add ability to view candidate details
    - (Note: Editing candidates not needed since they're hardcoded)
    - _Requirements: 9.2_
  - [ ] 13.3 Create Merkle root update interface
    - Write updateMerkleRoot function to submit new root
    - Display current root and new root for comparison
    - Require confirmation before submission
    - Show transaction status and gas cost
    - _Requirements: 9.3_
  - [ ] 13.4 Add system monitoring dashboard
    - Write getSystemStatus function to fetch blockchain data
    - Display contract balance and gas prices
    - Show recent transactions and events
    - Add connection status indicator
    - _Requirements: 9.5, 9.6_
  - [ ] 13.5 Implement admin action logging
    - Write logAdminAction function to record all admin operations
    - Store logs in localStorage with timestamps
    - Display audit trail in admin panel
    - Export logs as CSV
    - _Requirements: 9.7, 12.2_


- [ ] 14. Implement security and privacy features
  - [ ] 14.1 Add input sanitization
    - Write sanitizeInput function to clean user inputs
    - Prevent XSS attacks by escaping HTML
    - Validate all form inputs before processing
    - Implement Content Security Policy headers
    - _Requirements: 10.5_
  - [ ] 14.2 Implement secure session management
    - Use sessionStorage for temporary data only
    - Clear sensitive data on logout or session end
    - Set session timeout (30 minutes)
    - Validate session data on each page load
    - _Requirements: 10.7_
  - [ ] 14.3 Add cryptographic security measures
    - Ensure all hashes use keccak256
    - Generate cryptographically secure random salts
    - Validate hash formats (32 bytes)
    - Implement rate limiting for hash generation
    - _Requirements: 10.1, 10.6_
  - [ ] 14.4 Implement privacy protection
    - Never log full card numbers or passwords
    - Ensure no PII in blockchain transactions
    - Clear console logs in production
    - Add privacy policy notice
    - _Requirements: 10.6_

- [ ] 15. Add accessibility features
  - [ ] 15.1 Implement keyboard navigation
    - Add tabindex to all interactive elements
    - Implement keyboard shortcuts for common actions
    - Ensure focus order is logical
    - Add skip navigation links
    - _Requirements: 7.4, 7.5_
  - [ ] 15.2 Add ARIA labels and roles
    - Write aria-label for all buttons and inputs
    - Add role attributes for semantic HTML
    - Implement aria-live regions for dynamic content
    - Add aria-describedby for error messages
    - _Requirements: 7.4, 7.5_
  - [ ] 15.3 Ensure color contrast compliance
    - Test all color combinations for WCAG AA compliance
    - Adjust colors to meet 4.5:1 contrast ratio
    - Add visual indicators beyond color alone
    - Test with color blindness simulators
    - _Requirements: 7.4_
  - [ ] 15.4 Add reduced motion support
    - Implement prefers-reduced-motion media query
    - Disable animations for users who prefer reduced motion
    - Provide alternative feedback without animation
    - Test with accessibility tools
    - _Requirements: 7.2_


- [ ] 16. Implement error handling and user feedback
  - [ ] 16.1 Create error handling utilities
    - Write displayError function for user-friendly error messages
    - Map technical errors to readable messages
    - Add error logging to console for debugging
    - Implement error recovery suggestions
    - _Requirements: 7.6_
  - [ ] 16.2 Add loading states and spinners
    - Create loading spinner component
    - Show loading during blockchain queries
    - Display progress for multi-step processes
    - Implement skeleton screens for content loading
    - _Requirements: 4.6_
  - [ ] 16.3 Implement success notifications
    - Write showSuccess function for positive feedback
    - Display success messages with checkmark icon
    - Auto-dismiss after 5 seconds
    - Add sound notification (optional, with user control)
    - _Requirements: 4.7_
  - [ ] 16.4 Add retry mechanisms
    - Implement automatic retry for network failures (max 3 attempts)
    - Add manual retry button for user-initiated retries
    - Exponential backoff for repeated failures
    - Display retry count to user
    - _Requirements: 2.4_

- [ ] 17. Create configuration and setup files
  - [x] 17.1 Create config.js with contract details

    - Define contract address constant
    - Store contract ABI
    - Set Sepolia RPC URL
    - Configure gas limits and prices
    - _Requirements: 2.1, 2.2_
  - [x] 17.2 Create hardcoded candidate data in voting.js

    - Define 5 default candidates directly in JavaScript with id, name, party, symbol, description
    - Use emojis or simple icons for candidate symbols
    - Candidates should be: Candidate A, Candidate B, Candidate C, Candidate D, Candidate E
    - No external JSON file needed - all data embedded in code
    - _Requirements: 4.1, 4.2_
  - [x] 17.3 Create README.md with setup instructions


    - Document project structure
    - Provide installation steps
    - Explain how to deploy contract
    - Add usage instructions for voters and admins
    - Include troubleshooting section
    - _Requirements: 2.1_


- [ ] 18. Testing and quality assurance
  - [ ] 18.1 Write frontend unit tests
    - Test hash generation functions
    - Test Merkle tree construction and proof generation
    - Test input validation functions
    - Test data transformation utilities
    - _Requirements: 1.2, 3.1, 3.4_
  - [ ] 18.2 Perform integration testing
    - Test end-to-end voting flow (auth → vote → receipt)
    - Test admin operations (add candidate, update root)
    - Test dashboard updates after votes
    - Test error scenarios (network failure, invalid proof)
    - _Requirements: 1.7, 4.5, 6.3, 9.3_
  - [ ] 18.3 Conduct cross-browser testing
    - Test on Chrome, Firefox, Safari, Edge
    - Verify MetaMask integration on all browsers
    - Check responsive design on different screen sizes
    - Test on mobile devices (iOS and Android)
    - _Requirements: 11.6_
  - [ ] 18.4 Perform security testing
    - Test for XSS vulnerabilities
    - Verify input sanitization
    - Test session management and timeouts
    - Attempt double-voting scenarios
    - Test Merkle proof manipulation
    - _Requirements: 5.2, 5.3, 10.5_
  - [ ] 18.5 Conduct accessibility testing
    - Test with screen readers (NVDA, JAWS)
    - Verify keyboard navigation
    - Check color contrast with tools
    - Test with reduced motion enabled
    - _Requirements: 7.4, 7.5_

- [ ] 19. Optimization and performance tuning
  - [ ] 19.1 Optimize frontend performance
    - Minify CSS and JavaScript files
    - Compress images to WebP format
    - Implement lazy loading for non-critical resources
    - Add service worker for offline capability (optional)
    - _Requirements: 11.1_
  - [ ] 19.2 Optimize blockchain interactions
    - Batch multiple contract reads into single call
    - Cache contract data in localStorage with expiry
    - Implement optimistic UI updates
    - Reduce unnecessary blockchain queries
    - _Requirements: 6.3_
  - [ ] 19.3 Optimize gas usage
    - Review contract for gas optimization opportunities
    - Test gas costs for all contract functions
    - Document gas costs in README
    - Consider gas price estimation before transactions
    - _Requirements: 2.3_


- [ ] 20. Documentation and deployment
  - [ ] 20.1 Create user documentation
    - Write voter guide with screenshots
    - Document authentication process
    - Explain voting steps clearly
    - Add FAQ section
    - _Requirements: 1.7, 4.7_
  - [ ] 20.2 Create admin documentation
    - Document admin panel features
    - Explain Merkle root update process
    - Provide candidate management guide
    - Add security best practices
    - _Requirements: 9.2, 9.3_
  - [ ] 20.3 Prepare deployment package
    - Create deployment checklist
    - Configure hosting settings (GitHub Pages, Netlify, or Vercel)
    - Set up custom domain (optional)
    - Configure SSL certificate
    - _Requirements: 2.1_
  - [ ] 20.4 Deploy to production
    - Upload files to hosting platform
    - Verify contract address in config
    - Test all features on production URL
    - Monitor for errors and performance issues
    - _Requirements: 2.2_
  - [ ] 20.5 Create audit trail and transparency page
    - Build page showing all Merkle root updates
    - Display timeline of election events
    - Provide links to all transactions on Etherscan
    - Add export functionality for audit data
    - _Requirements: 12.1, 12.2, 12.3, 12.5, 12.6_

- [ ] 21. Final integration and polish
  - [ ] 21.1 Integrate all modules
    - Connect authentication to voting flow
    - Link voting to receipt generation
    - Connect dashboard to live blockchain data
    - Wire admin panel to contract functions
    - _Requirements: 1.7, 4.5, 6.1, 9.3_
  - [ ] 21.2 Add final UI polish
    - Refine animations and transitions
    - Ensure consistent spacing and alignment
    - Add loading states to all async operations
    - Implement smooth page transitions
    - _Requirements: 7.1, 7.2_
  - [ ] 21.3 Conduct final testing
    - Run complete end-to-end test scenarios
    - Verify all requirements are met
    - Test with multiple concurrent users
    - Perform final security review
    - _Requirements: All requirements_
  - [ ] 21.4 Create demo video and presentation
    - Record demo video showing full voting flow
    - Create presentation slides explaining the system
    - Highlight key features and security measures
    - Prepare for demonstration
    - _Requirements: 1.7, 4.7, 6.7_
