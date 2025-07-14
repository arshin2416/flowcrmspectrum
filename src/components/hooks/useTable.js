export function useTable() {
    const getAvatar = (user, availableUsers = [], isSelectedUser = false) => {
        let targetUser = user;
        
        // If this is a selected user, try to find the matching user in availableUsers
        if (isSelectedUser && availableUsers.length > 0) {
          const matchedUser = availableUsers.find(u => u.Id === user.Id);
          if (matchedUser) {
            targetUser = matchedUser;
          }
        }
        
        // Check if user has an avatar URL
        if (targetUser.AvatarUrl) {
          return { type: 'image', value: targetUser.AvatarUrl };
        }
        
        // Generate initials from first name and last name
        if (targetUser.FirstName && targetUser.LastName) {
          return { type: 'initials', value: `${targetUser.FirstName.charAt(0)}${targetUser.LastName.charAt(0)}`.toUpperCase() };
        }
        
        // Use first name initial if available
        if (targetUser.FirstName) {
          return { type: 'initials', value: targetUser.FirstName.charAt(0).toUpperCase() };
        }
        
        // Use last name initial if available
        if (targetUser.LastName) {
          return { type: 'initials', value: targetUser.LastName.charAt(0).toUpperCase() };
        }
        
        // Use first letter of email if available
        if (targetUser.Email) {
          return { type: 'initials', value: targetUser.Email.charAt(0).toUpperCase() };
        }
        
        // Default fallback
        return { type: 'initials', value: 'U' };
      };
      const getWhereGroups = (searchTerm = '', fieldName = 'Name', operator = 'Contains') => {
        if (!searchTerm || searchTerm.trim() === '') {
          return [];
        }
      
        return [
          {
            "operator": "AND",
            "subGroups": [
              {
                "conditions": [
                  {
                    "fieldName": fieldName,
                    "operator": operator,
                    "subOperator": "",
                    "values": [searchTerm.trim()]
                  }
                ],
                "operator": "AND"
              }
            ]
          }
        ];
      };
      const getDisplayName = (user) => {
        if (user.FirstName && user.LastName) {
          return `${user.FirstName} ${user.LastName}`;
        }
        return user.FirstName || user.LastName || user.Email || 'Unknown User';
      };


    return {
        getAvatar,
        getWhereGroups,
        getDisplayName
    };
}
