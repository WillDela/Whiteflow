window.initChat = function() {
    console.log("Chat initialized: Setting up listeners and state.");

    // --- State Variables ---
    let isOpen = false; // Initial state: Collapsed
    let messages = [];
    let showAccount = false;
    let currentRoom = 'general'; // Default room
    let currentUser = 'User'; // Will be set from Auth0
    let typingTimeout = null;
    
    // --- DOM Elements ---
    const sidebarContainer = document.getElementById('sidebar-container');
    const toggleCollapsedBtn = document.getElementById('toggle-collapsed');
    const toggleExpandedBtn = document.getElementById('toggle-expanded');
    const sidebarExpanded = document.getElementById('sidebar-expanded');
    const messagesContainer = document.getElementById('messages-container');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');

    // Utility Bar Elements (Account Only - Settings/Save handled by board.js)
    const userIcon = document.getElementById('user-icon');
    const accountOverlay = document.getElementById('account-overlay');

    // Verify critical elements exist
    if (!messagesContainer) {
        console.error('❌ messages-container not found in DOM!');
        return;
    }
    if (!messageInput || !sendButton) {
        console.error('❌ Chat input elements not found in DOM!');
        return;
    }
    
    console.log('✅ All chat DOM elements found');

    // --- Configuration ---
    
    // Get socket instance (should be initialized in mainJS.js)
    const socket = window.socket;
    if (!socket) {
        console.error('❌ Socket.IO not initialized!');
        return;
    }

    console.log('✅ Socket.IO found, ID:', socket.id, 'Connected:', socket.connected);
    
    // Log connection events for debugging
    socket.on('connect', () => {
        console.log('✅ Socket connected:', socket.id);
    });
    
    socket.on('disconnect', () => {
        console.log('❌ Socket disconnected');
    });

    // Cleanup any existing chat listeners first
    socket.off('chat:message');
    socket.off('chat:typing');

    // Fetch current user info from Auth0
    fetch('/api/user-data')
        .then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json();
        })
        .then(data => {
            if (data.user) {
                currentUser = data.user.name || data.user.email || 'User';
                console.log('✅ Chat user:', currentUser);
            }
        })
        .catch(err => {
            console.error('❌ Error fetching user data:', err);
            currentUser = 'User'; // Fallback
        });

    // Join the chat room
    socket.emit('join', currentRoom);
    console.log(`✅ Joined chat room: ${currentRoom}`);
    
    // --- Core Functions ---

    /**
     * Renders all messages to the DOM and scrolls to the bottom.
     */
    const renderMessages = () => {
        if (!messagesContainer) return;
        messagesContainer.innerHTML = ''; // Clear previous messages
        messages.forEach((msg) => {
            // Determine alignment and colors
            const alignClass = msg.fromSelf ? "flex-col items-end" : "flex-col items-start";
            const bubbleClasses = msg.fromSelf
                ? "bg-blue-600 text-white self-end"
                : "bg-[#2b3037] text-gray-200 self-start";
            const senderClasses = msg.fromSelf ? "self-end" : "self-start";

            // Only apply animation if 'animated' flag is true
            const animClass = msg.animated ? "animate-bounce-in" : "";

            const messageDiv = document.createElement('div');
            messageDiv.className = `flex ${alignClass} gap-1 ${animClass} w-full`;
            
            // Message Bubble
            const bubble = document.createElement('div');
            bubble.className = `${bubbleClasses} rounded-2xl px-3 py-2 text-[12px] leading-relaxed max-w-[80%] shadow-sm whitespace-pre-wrap`;
            bubble.style.wordWrap = 'break-word';
            bubble.style.overflowWrap = 'break-word';
            bubble.textContent = msg.text;
            
            // Sender Name/Initials
            const senderInitials = document.createElement('div');
            senderInitials.className = `rounded-full flex items-center justify-center text-black text-xs px-2 py-0.5 font-semibold bg-gray-200 ${senderClasses}`;
            senderInitials.textContent = msg.sender;

            messageDiv.appendChild(bubble);
            messageDiv.appendChild(senderInitials);
            messagesContainer.appendChild(messageDiv);
        });

        // Scroll to the bottom of the chat
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    };

    // Listen for incoming chat messages from Socket.IO
    socket.on('chat:message', (data) => {
        console.log('📨 Received chat message:', data);
        const { message, sender, socketId } = data;
        const fromSelf = socketId === socket.id;
        
        console.log(`📨 Message from ${sender}, fromSelf: ${fromSelf}, mySocketId: ${socket.id}, theirSocketId: ${socketId}`);
        
        messages.push({
            text: message,
            sender: sender || 'Anonymous',
            fromSelf: fromSelf,
            animated: true
        });
        
        console.log(`📨 Total messages in array: ${messages.length}`);
        renderMessages();
        
        // Clear animation flag after render
        setTimeout(() => {
            messages.forEach(m => m.animated = false);
        }, 500);
    });

    // Listen for typing indicators
    socket.on('chat:typing', (data) => {
        const { userName, isTyping } = data;
        // TODO: Display "userName is typing..." indicator
        console.log(`${userName} is ${isTyping ? 'typing' : 'stopped typing'}`);
    });

    const onToggle = () => {
        isOpen = !isOpen;
        renderSidebar();
    };

    /**
     * Applies the dynamic sizing styles based on the isOpen state.
     */
    const renderSidebar = () => {
        if (!sidebarContainer) return;

        // Apply main container styles (Animation handled by CSS transition on container)
        sidebarContainer.style.top = isOpen ? "7.5%" : "95%";
        sidebarContainer.style.transform = isOpen ? "translateY(0)" : "translateY(-50%)";
        sidebarContainer.style.width = isOpen ? "20rem" : "2.5rem";
        sidebarContainer.style.height = isOpen ? "90vh" : "2.5rem";
        sidebarContainer.style.borderRadius = isOpen ? "1.25rem" : "50%";
        
        // Smoothly transition content
        if (isOpen) {
            // 1. Fade out collapsed button
            toggleCollapsedBtn.style.opacity = '0';
            toggleCollapsedBtn.style.pointerEvents = 'none';

            // 2. Prepare expanded content
            sidebarExpanded.style.display = 'flex';
            
            // 3. Render messages immediately so layout is ready
            renderMessages();

            // 4. Delay fade-in slightly to allow container to start expanding
            setTimeout(() => {
                toggleCollapsedBtn.style.display = 'none'; // Hide button after fade
                sidebarExpanded.style.opacity = '1';
                sidebarExpanded.style.pointerEvents = 'auto';
            }, 150); 

        } else {
            // 1. Fade out expanded content immediately
            sidebarExpanded.style.opacity = '0';
            sidebarExpanded.style.pointerEvents = 'none';

            // 2. Fade in collapsed button
            toggleCollapsedBtn.style.display = 'flex';
            // Force reflow for transition
            void toggleCollapsedBtn.offsetWidth;
            toggleCollapsedBtn.style.opacity = '1';
            toggleCollapsedBtn.style.pointerEvents = 'auto';

            // 3. Hide expanded content from DOM after transition
            setTimeout(() => {
                if (!isOpen) { // Check in case user toggled back quickly
                    sidebarExpanded.style.display = 'none';
                }
            }, 300); // Match standard transition time
        }
    };

    const handleSend = () => {
        const text = messageInput.value.trim();
        if (!text) return;

        console.log(`Sending message to room ${currentRoom}: "${text}" from ${currentUser}`);
        
        // Send message via Socket.IO
        socket.emit('chat:message', {
            roomId: currentRoom,
            message: text,
            sender: currentUser,
            timestamp: new Date().toISOString()
        });
        
        messageInput.value = ''; // Clear input
        
        // Stop typing indicator
        if (typingTimeout) {
            clearTimeout(typingTimeout);
            typingTimeout = null;
        }
        socket.emit('chat:typing', { roomId: currentRoom, userName: currentUser, isTyping: false });
    };

    const handleTyping = () => {
        // Emit typing indicator
        socket.emit('chat:typing', { roomId: currentRoom, userName: currentUser, isTyping: true });
        
        // Clear previous timeout
        if (typingTimeout) {
            clearTimeout(typingTimeout);
        }
        
        // Set timeout to stop typing indicator after 2 seconds
        typingTimeout = setTimeout(() => {
            socket.emit('chat:typing', { roomId: currentRoom, userName: currentUser, isTyping: false });
        }, 2000);
    };

    const toggleAccount = (show) => {
        showAccount = typeof show === 'boolean' ? show : !showAccount;
        if (accountOverlay) {
            accountOverlay.style.display = showAccount ? 'flex' : 'none';
        }
    };

    // --- Event Listeners & Initialization ---
    
    // 1. Apply initial transition styles via JS
    if (sidebarExpanded) {
        sidebarExpanded.style.transition = 'opacity 0.3s ease-in-out';
        sidebarExpanded.style.opacity = '0';
    }
    if (toggleCollapsedBtn) {
        toggleCollapsedBtn.style.transition = 'opacity 0.3s ease-in-out';
    }
    
    // 2. Initial render for all dynamic elements
    renderSidebar();

    // 3. Attach Sidebar listeners
    if (toggleCollapsedBtn) toggleCollapsedBtn.addEventListener('click', onToggle);
    if (toggleExpandedBtn) toggleExpandedBtn.addEventListener('click', onToggle);
    
    if (sendButton) sendButton.addEventListener('click', handleSend);
    if (messageInput) {
        messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleSend();
            }
        });
        messageInput.addEventListener('input', handleTyping);
    }

    // 4. Attach Utility Bar listeners (Account Only)
    if (userIcon) userIcon.addEventListener('click', () => toggleAccount(true));

    // 5. Add click listeners to close overlays (backdrop clicks)
    if (accountOverlay) {
        accountOverlay.addEventListener('click', (e) => {
            if (e.target === accountOverlay) toggleAccount(false);
        });
    }
    
    // Expose toggle functions globally for use in modal buttons (HTML onclicks)
    window.toggleAccount = toggleAccount;

    // Cleanup function for when navigating away from board
    window.cleanupChat = function() {
        // Remove Socket.IO listeners to prevent duplicates
        if (socket) {
            socket.off('chat:message');
            socket.off('chat:typing');
        }
        console.log('Chat cleanup: Removed Socket.IO listeners');
    };
};

// Auto-init for direct page loads or when script is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.initChat);
} else {
    window.initChat();
}
