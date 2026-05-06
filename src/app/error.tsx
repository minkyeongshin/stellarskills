"use client";

import { Button, Card, Heading, Icon, Text } from "@stellar/design-system";
import { Box } from "@/components/layout/Box";

export default function Error() {
  return (
    <Card>
      <Box gap="xl" align="start">
        <Box gap="md">
          <Heading as="h2" size="xs" weight="medium">
            Unhandled Error
          </Heading>

          <Text size="sm" as="p">
            Uh-oh, we didn’t handle this error. We would appreciate it if you
            opened an issue on GitHub, providing as many details as possible to
            help us fix this bug.
          </Text>
        </Box>

        <Box gap="md" direction="row">
          <Button
            size="sm"
            variant="secondary"
            icon={<Icon.ArrowLeft />}
            iconPosition="left"
            onClick={() => {
              location.reload();
            }}
          >
            Return
          </Button>

          <Button
            size="sm"
            variant="primary"
            iconPosition="left"
            onClick={() =>
              window.open(
                "https://github.com/stellar/laboratory/issues",
                "_blank",
                "noopener,noreferrer",
              )
            }
          >
            Open Issue
          </Button>
        </Box>
      </Box>
    </Card>
  );
}
