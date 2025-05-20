const ORGANIZATIONS_API_URL = 'https://app.dev.aiguro.ru/api/organizations';
// Note: The cURL for create uses /api/organization (singular), while GET uses /api/organizations (plural).
// Adjusting CREATE_ORG_API_URL accordingly.
const CREATE_ORG_API_URL = 'https://app.dev.aiguro.ru/api/organization';

export class AiguroOrganizationApi {
  static async getOrganizations(token: string): Promise<any[] | null> {
    if (!token) {
      console.error(
        '[AiguroOrganizationApi] getOrganizations called without a token.'
      );
      return null;
    }
    try {
      console.log(
        `[AiguroOrganizationApi] Attempting to GET organizations. Token (first 10 chars): ${token.substring(0, 10)}...`
      );
      const response = await fetch(ORGANIZATIONS_API_URL, {
        // Using plural for GET
        method: 'GET',
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          '[AiguroOrganizationApi] Failed to GET organizations. Status:',
          response.status,
          'Response:',
          errorText
        );
        return null;
      }

      const organizations = await response.json();
      console.log(
        '[AiguroOrganizationApi] Successfully fetched organizations:',
        organizations
      );
      return organizations;
    } catch (error) {
      console.error(
        '[AiguroOrganizationApi] Unexpected error while GETTING organizations:',
        error
      );
      return null;
    }
  }

  static async createOrganization(
    token: string,
    companyName: string
  ): Promise<any | null> {
    if (!token) {
      console.error(
        '[AiguroOrganizationApi] createOrganization called without a token.'
      );
      return null;
    }
    if (!companyName || companyName.trim() === '') {
      console.error(
        '[AiguroOrganizationApi] createOrganization called without a company name.'
      );
      return null;
    }
    try {
      console.log(
        `[AiguroOrganizationApi] Attempting to POST new organization: ${companyName}. Token (first 10 chars): ${token.substring(0, 10)}...`
      );
      const response = await fetch(CREATE_ORG_API_URL, {
        // Using singular for POST as per cURL
        method: 'POST',
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          display_name: companyName,
          is_active: true // Defaulting to true as per cURL example
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          '[AiguroOrganizationApi] Failed to POST new organization. Status:',
          response.status,
          'Response:',
          errorText
        );
        return null;
      }

      const newOrganization = await response.json();
      console.log(
        '[AiguroOrganizationApi] Successfully created new organization:',
        newOrganization
      );
      return newOrganization;
    } catch (error) {
      console.error(
        '[AiguroOrganizationApi] Unexpected error while POSTING new organization:',
        error
      );
      return null;
    }
  }

  static async deleteOrganization(
    token: string,
    organizationId: string
  ): Promise<boolean> {
    if (!token) {
      console.error(
        '[AiguroOrganizationApi] deleteOrganization called without a token.'
      );
      return false;
    }
    if (!organizationId) {
      console.error(
        '[AiguroOrganizationApi] deleteOrganization called without an organizationId.'
      );
      return false;
    }

    const DELETE_ORG_URL = `${CREATE_ORG_API_URL}/${organizationId}`; // Assuming CREATE_ORG_API_URL is /api/organization

    try {
      console.log(
        `[AiguroOrganizationApi] Attempting to DELETE organization ID: ${organizationId}. Token (first 10 chars): ${token.substring(0, 10)}...`
      );
      const response = await fetch(DELETE_ORG_URL, {
        method: 'DELETE',
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        // Attempt to get more detailed error if possible
        let errorDetails = `Status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorDetails = `${errorDetails}, Body: ${JSON.stringify(errorData)}`;
        } catch (e) {
          // If response is not JSON, use text
          try {
            const errorText = await response.text();
            errorDetails = `${errorDetails}, Body: ${errorText}`;
          } catch (textErr) {
            // ignore if can't get text either
          }
        }
        console.error(
          '[AiguroOrganizationApi] Failed to DELETE organization.',
          errorDetails
        );
        return false;
      }

      // For DELETE, a 204 No Content or 200 OK without significant body is common.
      // Checking response.ok is usually sufficient.
      console.log(
        `[AiguroOrganizationApi] Successfully DELETED organization ID: ${organizationId}. Status: ${response.status}`
      );
      return true;
    } catch (error) {
      console.error(
        `[AiguroOrganizationApi] Unexpected error while DELETING organization ID: ${organizationId}:`,
        error
      );
      return false;
    }
  }
}
